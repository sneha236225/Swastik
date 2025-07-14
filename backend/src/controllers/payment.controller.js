import userModel from "../models/user/user.model.js";
import { nanoid } from "nanoid";

export const paymentSuccess = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.paymentStatus === "paid") {
      return res.status(400).json({ message: "Payment already completed" });
    }

    let distributorCode;
    let codeExists = true;

    while (codeExists) {
      distributorCode = nanoid(8);

      if (user.referralCode && user.referralCode === distributorCode) {
        continue;
      }

      const existingCode = await userModel.findOne({
        distributorCode,
      });

      if (!existingCode) {
        codeExists = false;
      }
    }

    if (user.referralCode && user.referralCode === distributorCode) {
      return res.status(400).json({
        message: "You cannot use your own distributor code as referral.",
      });
    }

    user.distributorCode = distributorCode;
    user.paymentStatus = "paid";
    await user.save();

    res.status(200).json({
      message: "Payment successful. Distributor code generated.",
      distributorCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

