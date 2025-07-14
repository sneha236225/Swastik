import userModel from "../../models/user/user.model.js";
import settingsModel from "../../models/settings/settings.model.js";
import payoutModel from "../../models/payout/payout.model.js";

export const checkCashbackEligibility = async (req, res) => {
  try {
    const { id } = req.params;

    // find user
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // check payment status
    if (user.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "User has not completed payment yet.",
      });
    }

    // find settings
    let settings = await settingsModel.findOne();
    if (!settings) {
      settings = await settingsModel.create({});
    }

    // find direct referrals of this user
    const directReferrals = await userModel.find({
      referralCode: user.distributorCode,
      paymentStatus: "paid",
      _id: { $ne: user._id },
    });

    // check eligibility
    if (directReferrals.length >= settings.cashbackReferralsRequired) {
      const cashbackAmount = settings.cashbackAmount;
      const tdsPercentage = settings.tdsPercentage;
      const tds = (cashbackAmount * tdsPercentage) / 100;
      const netCashback = cashbackAmount - tds;

      return res.status(200).json({
        message: "User is eligible for cashback.",
        totalCashback: cashbackAmount,
        tdsPercentage,
        tdsDeducted: tds,
        netCashback,
        directReferrals: directReferrals.length,
      });
    } else {
      return res.status(200).json({
        message: "User is not eligible for cashback yet.",
        requiredReferrals: settings.cashbackReferralsRequired,
        currentReferrals: directReferrals.length,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const releaseCashback = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "User has not completed payment yet.",
      });
    }

    // check if cashback already paid
    const existingPayout = await payoutModel.findOne({
      userId: user._id,
      type: "cashback",
    });

    if (existingPayout) {
      return res.status(409).json({
        message: "Cashback already released for this user.",
      });
    }

    let settings = await settingsModel.findOne();
    if (!settings) {
      settings = await settingsModel.create({});
    }

    // find direct referrals
    const directReferrals = await userModel.find({
      referralCode: user.distributorCode,
      paymentStatus: "paid",
      email: { $ne: user.email },
    });

    if (directReferrals.length < settings.cashbackReferralsRequired) {
      return res.status(400).json({
        message: `User has only ${directReferrals.length} referrals. Cashback requires ${settings.cashbackReferralsRequired} referrals.`,
      });
    }

    const cashbackAmount = settings.cashbackAmount;
    const tdsPercentage = settings.tdsPercentage;
    const tds = (cashbackAmount * tdsPercentage) / 100;
    const netCashback = cashbackAmount - tds;

    // Save payout record
    const payout = await payoutModel.create({
      userId: user._id,
      amount: cashbackAmount,
      tdsDeducted: tds,
      netAmount: netCashback,
      type: "cashback",
      week: getCurrentWeekDate(),
      status: "paid",
    });

    res.status(200).json({
      message: "Cashback released successfully.",
      payout,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

function getCurrentWeekDate() {
  const now = new Date();
  now.setDate(now.getDate() - now.getDay() + 2); // Tuesday
  return now.toISOString().substring(0, 10);
}
