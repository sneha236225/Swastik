import userModel from "../../models/user/user.model.js";
import settingsModel from "../../models/settings/settings.model.js";
import orderModel from "../../models/order/order.model.js";
import payoutModel from "../../models/payout/payout.model.js";

export const checkBonusEligibility = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    let settings = await settingsModel.findOne();
    if (!settings) {
      settings = await settingsModel.create({});
    }

    // all direct referrals of this user
    const directCodes = await userModel.find({
      referralCode: user.distributorCode,
      paymentStatus: "paid",
      email: { $ne: user.email },
    });

    if (directCodes.length < 4) {
      return res.status(400).json({
        message: `User has only ${directCodes.length} direct codes. Minimum 4 required for TPB bonus.`,
      });
    }

    let eligibleCodes = 0;
    let totalSales = 0;

    for (const ref of directCodes) {
      const orders = await orderModel.find({
        userId: ref._id,
      });

      let refSales = 0;
      for (const ord of orders) {
        for (const p of ord.products) {
          refSales += p.quantity;
        }
      }

      if (refSales >= 12) {
        eligibleCodes += 1;
      }

      totalSales += refSales;
    }

    if (eligibleCodes < 4) {
      return res.status(400).json({
        message: `Only ${eligibleCodes} direct codes completed 12 sales. Minimum 4 required for TPB bonus.`,
        eligibleCodes,
        totalSales,
      });
    }

    // Calculate turnover
    const ordersOfTeam = await orderModel.find({
      userId: { $in: directCodes.map((u) => u._id) },
    });

    let turnover = 0;
    for (const ord of ordersOfTeam) {
      turnover += ord.totalAmount;
    }

    const bonusRate = settings.tpbBonusRate || 1; // default 1%
    const bonusAmount = (turnover * bonusRate) / 100;

    return res.status(200).json({
      message: "User is eligible for TPB bonus.",
      eligibleCodes,
      totalSales,
      turnover,
      bonusRate,
      bonusAmount: Number(bonusAmount.toFixed(2)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const releaseBonus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    let settings = await settingsModel.findOne();
    if (!settings) {
      settings = await settingsModel.create({});
    }

    const ordersOfTeam = await orderModel.find({
      userId: {
        $in: await userModel
          .find({
            referralCode: user.distributorCode,
            paymentStatus: "paid",
            email: { $ne: user.email },
          })
          .then((users) => users.map((u) => u._id)),
      },
    });

    let turnover = 0;
    for (const ord of ordersOfTeam) {
      turnover += ord.totalAmount;
    }

    const bonusRate = settings.tpbBonusRate || 1;
    const bonusAmount = (turnover * bonusRate) / 100;

    const tds = (bonusAmount * settings.tdsPercentage) / 100;
    const netBonus = bonusAmount - tds;

    // Check if bonus already paid
    const existingPayout = await payoutModel.findOne({
      userId: user._id,
      type: "bonus",
    });

    if (existingPayout) {
      return res.status(409).json({
        message: "Bonus already released for this user.",
      });
    }

    const payout = await payoutModel.create({
      userId: user._id,
      amount: bonusAmount,
      tdsDeducted: tds,
      netAmount: netBonus,
      type: "bonus",
      week: getCurrentWeekDate(),
      status: "paid",
    });

    res.status(200).json({
      message: "Bonus released successfully.",
      payout,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

function getCurrentWeekDate() {
  const now = new Date();
  now.setDate(now.getDate() - now.getDay() + 2);
  return now.toISOString().substring(0, 10);
}
