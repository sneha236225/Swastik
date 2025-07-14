import orderModel from "../../models/order/order.model.js";
import userModel from "../../models/user/user.model.js";
import productModel from "../../models/product/product.model.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create Order
export const createOrder = async (req, res) => {
  try {
    const { userId, products, paymentMethod, shippingAddress } = req.body;

    if (!userId || !products || !paymentMethod || !shippingAddress) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products array is required." });
    }

    for (let item of products) {
      if (!item.product || !isValidObjectId(item.product)) {
        return res.status(400).json({ message: "Invalid product ID." });
      }
      if (!item.qty || item.qty < 1) {
        return res
          .status(400)
          .json({ message: "Product qty must be at least 1." });
      }
    }

    const allowedMethods = ["COD", "Online", "Wallet"];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    if (shippingAddress.trim().length < 10) {
      return res.status(400).json({ message: "Shipping address too short." });
    }

    let totalAmount = 0;
    const productsArray = [];

    for (let item of products) {
      const product = await productModel.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `Not enough stock for product ${product.name}. Available: ${product.stock}`,
        });
      }

      const effectivePrice =
        product.discountPrice && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;

      totalAmount += item.qty * effectivePrice;

      productsArray.push({
        product: product._id,
        name: product.name,
        qty: item.qty,
        price: effectivePrice,
      });

      // Reduce stock
      product.stock -= item.qty;
      await product.save();
    }

    const order = await orderModel.create({
      user: userId,
      products: productsArray,
      totalAmount,
      paymentMethod,
      shippingAddress,
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
    });

    res.status(201).json({
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("user", "name email")
      .populate("products.product", "name price");

    res.status(200).json({
      total: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Single Order
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const order = await orderModel
      .findById(id)
      .populate("user", "name email")
      .populate("products.product", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const allowedStatus = ["Processing", "Shipped", "Delivered", "Returned"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status === "Delivered" && status === "Processing") {
      return res.status(400).json({
        message: "Cannot change Delivered order back to Processing.",
      });
    }

    order.status = status;

    // Update paymentStatus if Delivered
    if (status === "Delivered" && order.paymentStatus === "pending") {
      order.paymentStatus = "paid";
    }

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Track returns
export const markOrderAsReturned = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, restock } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.isReturned) {
      return res.status(400).json({ message: "Order already marked as returned." });
    }

    // Check Return Window (e.g. 7 days after delivery)
    const maxReturnDays = 7;
    if (order.status === "Delivered" && order.deliveredAt) {
      const diffDays = Math.floor(
        (new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > maxReturnDays) {
        return res.status(400).json({
          message: `Return window expired. Only returns within ${maxReturnDays} days allowed.`,
        });
      }
    }

    order.isReturned = true;
    order.returnReason = reason || "No reason provided";
    order.returnDate = new Date();
    order.restock = restock !== undefined ? restock : true;

    // Refund Logic
    order.refundStatus = "initiated";
    order.refundAmount = order.totalAmount;

    // Restock logic
    if (order.restock) {
      for (let item of order.products) {
        const product = await productModel.findById(item.product);
        if (product) {
          product.stock += item.qty;
          await product.save();
        }
      }
    }

    await order.save();

    res.status(200).json({
      message: "Order marked as returned.",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

