import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
    },
    address: {
      type: String,
    },
    distributorCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referralCode: {
      type: String,
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    panCard: {
      type: String,
    },
    aadhaar: {
      type: String,
    },
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
