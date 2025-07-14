import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    tdsPercentage: {
      type: Number,
      default: 5,
    },
    cashbackReferralsRequired: {
      type: Number,
      default: 3,
    },
    cashbackAmount: {
      type: Number,
      default: 6000,
    },
    tpbBonusRate: {
      type: Number,
      default: 2, 
    },
    payoutDay: {
      type: String,
      default: "Tuesday",
    },
  },
  { timestamps: true }
);

const settingsModel = mongoose.model("Settings", settingsSchema);

export default settingsModel;
