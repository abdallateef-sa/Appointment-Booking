import SubscriptionPlan from "../models/planModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";

export const listActivePlans = asyncWrapper(async (req, res) => {
  const plans = await SubscriptionPlan.find({ isActive: true })
    .select(
      "name description sessionsPerMonth sessionsPerWeek price currency duration isActive"
    )
    .sort("price");

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: plans.length,
    data: { plans },
  });
});
