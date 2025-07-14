import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  tdsDeducted: {
    type: Number,
    default: 0,
  },
  netAmount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["cashback", "bonus"],
    required: true,
  },
  week: {
    type: String, 
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "paid",
  },
}, { timestamps: true });

const payoutModel = mongoose.model("Payout", payoutSchema);

export default payoutModel;
