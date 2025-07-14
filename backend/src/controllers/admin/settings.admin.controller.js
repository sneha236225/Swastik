import settingsModel from "../../models/settings/settings.model.js";
import userModel from "../../models/user/user.model.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await settingsModel.findOne();

    if (!settings) {
      settings = await settingsModel.create({});
    }

    res.status(200).json({
      message: "Settings fetched successfully.",
      settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const {
      tdsPercentage,
      tpbBonusRate,
      payoutDay,
      cashbackAmount,
      cashbackReferralsRequired,
    } = req.body;

    const updateData = {};

    if (tdsPercentage !== undefined) {
      if (isNaN(tdsPercentage) || tdsPercentage < 0 || tdsPercentage > 100) {
        return res.status(400).json({
          message: "TDS percentage must be between 0 and 100.",
        });
      }
      updateData.tdsPercentage = Number(tdsPercentage);
    }

    if (tpbBonusRate !== undefined) {
      if (isNaN(tpbBonusRate) || tpbBonusRate < 0 || tpbBonusRate > 100) {
        return res.status(400).json({
          message: "TPB bonus rate must be between 0 and 100.",
        });
      }
      updateData.tpbBonusRate = Number(tpbBonusRate);
    }

    if (cashbackAmount !== undefined) {
      if (isNaN(cashbackAmount) || cashbackAmount < 0) {
        return res.status(400).json({
          message: "Cashback amount must be a valid non-negative number.",
        });
      }
      updateData.cashbackAmount = Number(cashbackAmount);
    }

    if (cashbackReferralsRequired !== undefined) {
      if (isNaN(cashbackReferralsRequired) || cashbackReferralsRequired < 0) {
        return res.status(400).json({
          message:
            "Cashback referrals required must be a valid non-negative number.",
        });
      }
      updateData.cashbackReferralsRequired = Number(cashbackReferralsRequired);
    }

    if (payoutDay !== undefined) {
      const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      if (!validDays.includes(payoutDay)) {
        return res.status(400).json({
          message: "Payout day must be a valid weekday name.",
        });
      }
      updateData.payoutDay = payoutDay;
    }

    const updated = await settingsModel.findOneAndUpdate({}, updateData, {
      new: true,
    });

    res.status(200).json({
      message: "Settings updated successfully.",
      settings: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};
