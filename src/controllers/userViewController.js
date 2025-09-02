import asyncWrapper from "../middlewares/asyncWrapper.js";
import httpStatusText from "../utils/httpStatusText.js";
import Subscription from "../models/subscriptionModel.js";
import Session from "../models/sessionModel.js";

export const mySubscriptions = asyncWrapper(async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.user.id };
  if (status) filter.status = status;

  const items = await Subscription.find(filter)
    .populate({ path: "subscriptionPlan", select: "name" })
    .sort({ createdAt: -1 });

  res.status(200).json({ status: httpStatusText.SUCCESS, data: items });
});

export const mySessions = asyncWrapper(async (req, res) => {
  const { status, dateFrom, dateTo } = req.query;
  const filter = { user: req.user.id };
  if (status) filter.status = status;
  if (dateFrom || dateTo) {
    filter.startsAt = {};
    if (dateFrom) filter.startsAt.$gte = new Date(dateFrom);
    if (dateTo) filter.startsAt.$lte = new Date(dateTo);
  }

  const items = await Session.find(filter)
    .populate({
      path: "subscription",
      populate: { path: "subscriptionPlan", select: "name" },
    })
    .sort({ startsAt: -1 });

  res.status(200).json({ status: httpStatusText.SUCCESS, data: items });
});
