import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online", "Wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Returned"],
      default: "Processing",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    invoiceUrl: {
      type: String,
    },
    isReturned: {
      type: Boolean,
      default: false,
    },
    returnReason: {
      type: String,
    },
    returnDate: { 
      type: Date 
    },
    restock: { 
      type: Boolean, 
      default: true 
    },
    refundStatus: {
      type: String,
      enum: ["not_initiated", "initiated", "completed"],
      default: "not_initiated",
    },
    refundAmount: { 
      type: Number, 
      default: 0 
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("Order", orderSchema);
export default orderModel;
