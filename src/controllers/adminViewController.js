import asyncWrapper from "../middlewares/asyncWrapper.js";
import httpStatusText from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import Subscription from "../models/subscriptionModel.js";
import Session from "../models/sessionModel.js";

export const adminListSubscriptions = asyncWrapper(async (req, res, next) => {
  const { status, user, plan, startDateFrom, startDateTo } = req.query;

  const filter = {};
  if (status) filter.status = status; // expected values: active|cancelled|expired
  if (user) filter.user = user; // user id
  if (plan) filter.subscriptionPlan = plan; // plan id
  if (startDateFrom || startDateTo) {
    filter.startDate = {};
    if (startDateFrom) filter.startDate.$gte = new Date(startDateFrom);
    if (startDateTo) filter.startDate.$lte = new Date(startDateTo);
  }

  const items = await Subscription.find(filter)
    .populate({ path: "user", select: "name email" })
    .populate({ path: "subscriptionPlan", select: "name" })
    .sort({ createdAt: -1 });

  res.status(200).json({ status: httpStatusText.SUCCESS, data: items });
});

export const adminListSessions = asyncWrapper(async (req, res, next) => {
  const { status, user, subscription, dateFrom, dateTo } = req.query;

  const filter = {};
  if (status) filter.status = status; // scheduled|completed|cancelled|missed
  if (user) filter.user = user;
  if (subscription) filter.subscription = subscription;
  if (dateFrom || dateTo) {
    filter.startsAt = {};
    if (dateFrom) filter.startsAt.$gte = new Date(dateFrom);
    if (dateTo) filter.startsAt.$lte = new Date(dateTo);
  }

  const items = await Session.find(filter)
    .populate({ path: "user", select: "name email" })
    .populate({
      path: "subscription",
      populate: { path: "subscriptionPlan", select: "name" },
    })
    .sort({ startsAt: -1 });

  res.status(200).json({ status: httpStatusText.SUCCESS, data: items });
});
