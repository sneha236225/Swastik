import userModel from "../../models/user/user.model.js";
import orderModel from "../../models/order/order.model.js";
import mongoose from "mongoose";

//fetching all users
export const getAllUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const totalUsers = await userModel.countDocuments(query);

    const users = await userModel
      .find(query, "-password -__v")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    if (!users.length) {
      return res.status(200).json({
        message: "No users found.",
        total: 0,
        users: [],
      });
    }

    res.status(200).json({
      message: "Users fetched successfully",
      total: totalUsers,
      page: Number(page),
      limit: Number(limit),
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

//fetching single user
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await userModel.findById(id, "-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Acivate/DeActivate user
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isActive === isActive) {
      return res.status(400).json({
        message: `User is already ${isActive ? "active" : "deactivated"}.`,
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

//updating Kyc status
export const updateKycStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { kycStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    const allowedStatuses = ["pending", "verified", "rejected"];
    if (!allowedStatuses.includes(kycStatus)) {
      return res.status(400).json({
        message: `Invalid KYC status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const user = await userModel.findByIdAndUpdate(
      id,
      { kycStatus },
      { new: true, projection: "-password -__v" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `KYC status updated to ${kycStatus}`,
      user,
    });
  } catch (error) {
    console.error("Error updating KYC status:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};  

//track user referrals
export const trackUserReferrals = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const referrals = await userModel.find(
      {
        referralCode: user.distributorCode,
        _id: { $ne: user._id },
      },
      "-password -__v"
    );

    res.status(200).json({
      message: "Referrals fetched successfully",
      total: referrals.length,
      referrals,
    });
  } catch (error) {
    console.error("Track Referrals Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get user purchases by id
export const getUserPurchases = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const orders = await orderModel
      .find({ user: userId })
      .populate("products.product", "name price discountPrice");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No purchases found for this user." });
    }

    const totalAmountSpent = orders.reduce(
      (acc, curr) => acc + curr.totalAmount,
      0
    );

    res.status(200).json({
      message: "User purchase history fetched successfully.",
      totalOrders: orders.length,
      totalAmountSpent,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error."});
  }
};

 