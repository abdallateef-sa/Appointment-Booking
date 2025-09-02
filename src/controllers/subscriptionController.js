import Subscription from "../models/subscriptionModel.js";
import SubscriptionPlan from "../models/subscriptionPlanModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";

export const subscribeToPlan = asyncWrapper(async (req, res, next) => {
  const { subscriptionPlanId, startDate } = req.body;
  const userId = req.user.id;

  const plan = await SubscriptionPlan.findById(subscriptionPlanId);
  if (!plan || !plan.isActive) {
    return next(
      new AppError(
        "Subscription plan not found or inactive",
        404,
        httpStatusText.FAIL
      )
    );
  }

  const existing = await Subscription.findOne({
    user: userId,
    subscriptionPlan: subscriptionPlanId,
    status: "active",
  });
  if (existing) {
    return next(
      new AppError(
        "You already have an active subscription to this plan",
        409,
        httpStatusText.FAIL
      )
    );
  }

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + plan.duration);

  const subscription = await Subscription.create({
    user: userId,
    subscriptionPlan: subscriptionPlanId,
    startDate: start,
    endDate: end,
    totalSessions: plan.sessionsPerMonth,
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Subscribed successfully",
    data: {
      subscription: {
        id: subscription._id,
        planName: plan.name,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        totalSessions: subscription.totalSessions,
        sessionsRemaining: subscription.sessionsRemaining,
        status: subscription.status,
      },
    },
  });
});
