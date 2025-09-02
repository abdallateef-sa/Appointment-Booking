import Session from "../models/sessionModel.js";
import Subscription from "../models/subscriptionModel.js";
import SubscriptionPlan from "../models/subscriptionPlanModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import sendMail from "../utils/sendMaile.js";
import {
  buildIcsForSessions,
  generateSessionsConfirmedTemplates,
} from "../utils/emailTemplates.js";

function toStartsAt(dateStr, timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(dateStr);
  d.setHours(h, m, 0, 0);
  return d;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // Monday as week start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const bulkCreateSessions = asyncWrapper(async (req, res, next) => {
  const { subscriptionId, sessions } = req.body; // sessions: [{date, time}, ...]
  const userId = req.user.id;

  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    user: userId,
  }).populate("subscriptionPlan");
  if (!subscription) {
    return next(
      new AppError("Subscription not found", 404, httpStatusText.FAIL)
    );
  }
  if (subscription.status !== "active") {
    return next(
      new AppError("Subscription is not active", 400, httpStatusText.FAIL)
    );
  }

  const plan = subscription.subscriptionPlan;

  // Basic totals check
  if (
    subscription.sessionsUsed + sessions.length >
    subscription.totalSessions
  ) {
    return next(
      new AppError(
        "Number of sessions exceeds your plan limit",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const now = new Date();
  const startWindow = new Date(subscription.startDate);
  const endWindow = new Date(subscription.endDate);

  // Build startsAt list and dedupe within payload
  const startsAtList = sessions.map((s) => toStartsAt(s.date, s.time));
  const dedupe = new Set(startsAtList.map((d) => d.getTime()));
  if (dedupe.size !== startsAtList.length) {
    return next(
      new AppError(
        "Duplicate session date/time in request",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Validate each proposed session
  for (const dt of startsAtList) {
    if (dt < now)
      return next(
        new AppError(
          "Session time cannot be in the past",
          400,
          httpStatusText.FAIL
        )
      );
    if (dt < startWindow || dt > endWindow)
      return next(
        new AppError(
          "Session must be within subscription window",
          400,
          httpStatusText.FAIL
        )
      );
  }

  // Per-week cap validation (existing + new in same weeks)
  const weeklyMap = new Map();
  for (const dt of startsAtList) {
    const ws = getWeekStart(dt).getTime();
    weeklyMap.set(ws, (weeklyMap.get(ws) || 0) + 1);
  }

  // Count existing sessions by week
  const existingSessions = await Session.find({
    subscription: subscription._id,
    startsAt: { $gte: startWindow, $lte: endWindow },
    status: { $in: ["scheduled", "completed"] },
  }).select("startsAt");

  const existingWeekly = new Map();
  for (const s of existingSessions) {
    const ws = getWeekStart(s.startsAt).getTime();
    existingWeekly.set(ws, (existingWeekly.get(ws) || 0) + 1);
  }

  for (const [ws, addCount] of weeklyMap) {
    const existingCount = existingWeekly.get(ws) || 0;
    if (existingCount + addCount > plan.sessionsPerWeek) {
      return next(
        new AppError(
          "Weekly sessions limit exceeded for one of the weeks",
          400,
          httpStatusText.FAIL
        )
      );
    }
  }

  // Check conflicts with existing sessions for the user
  const conflict = await Session.findOne({
    user: userId,
    startsAt: { $in: startsAtList },
  });
  if (conflict) {
    return next(
      new AppError(
        "You already have a session at one of the selected times",
        409,
        httpStatusText.FAIL
      )
    );
  }

  // Create sessions
  const docs = startsAtList.map((startsAt) => ({
    subscription: subscription._id,
    user: userId,
    startsAt,
  }));
  await Session.insertMany(docs);

  // Update subscription usage
  subscription.sessionsUsed += startsAtList.length;
  await subscription.save();

  // If fully scheduled, send email confirmation with ICS
  if (subscription.sessionsUsed === subscription.totalSessions) {
    const email = req.user.email;
    const sorted = [...startsAtList].sort((a, b) => a - b);
    const { html, text } = generateSessionsConfirmedTemplates({
      recipientName: req.user.name || "User",
      planName: plan.name,
      totalSessions: subscription.totalSessions,
      startsAtList: sorted,
    });
    const ics = buildIcsForSessions({
      uidBase: String(subscription._id),
      organizerEmail: process.env.EMAIL_FROM,
      userEmail: email,
      planName: plan.name,
      events: sorted.map((d) => ({ startsAt: d, durationMinutes: 60 })),
    });
    const options = {
      email,
      subject: "Your sessions are confirmed",
      html,
      text,
      attachments: [
        {
          filename: "sessions.ics",
          content: ics,
          contentType: "text/calendar; method=PUBLISH",
        },
      ],
    };
    try {
      await sendMail(options);
    } catch (_) {
      /* silently ignore email errors */
    }
  }

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Sessions scheduled successfully",
    data: {
      added: startsAtList.length,
      sessionsRemaining: subscription.sessionsRemaining,
    },
  });
});

export const createSession = asyncWrapper(async (req, res, next) => {
  const { subscriptionId, date, time, notes } = req.body;
  const userId = req.user.id;

  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    user: userId,
  }).populate("subscriptionPlan");
  if (!subscription) {
    return next(
      new AppError("Subscription not found", 404, httpStatusText.FAIL)
    );
  }
  if (subscription.status !== "active") {
    return next(
      new AppError("Subscription is not active", 400, httpStatusText.FAIL)
    );
  }

  const plan = subscription.subscriptionPlan;
  if (subscription.sessionsUsed + 1 > subscription.totalSessions) {
    return next(
      new AppError(
        "You reached your plan's session limit",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const startsAt = toStartsAt(date, time);
  const now = new Date();
  if (startsAt < now) {
    return next(
      new AppError(
        "Session time cannot be in the past",
        400,
        httpStatusText.FAIL
      )
    );
  }
  if (startsAt < subscription.startDate || startsAt > subscription.endDate) {
    return next(
      new AppError(
        "Session must be within subscription window",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Weekly cap
  const ws = getWeekStart(startsAt);
  const we = new Date(ws);
  we.setDate(we.getDate() + 6);
  we.setHours(23, 59, 59, 999);
  const weeklyCount = await Session.countDocuments({
    subscription: subscription._id,
    startsAt: { $gte: ws, $lte: we },
    status: { $in: ["scheduled", "completed"] },
  });
  if (weeklyCount + 1 > plan.sessionsPerWeek) {
    return next(
      new AppError("Weekly sessions limit exceeded", 400, httpStatusText.FAIL)
    );
  }

  // Conflict check for user at same time
  const conflict = await Session.findOne({ user: userId, startsAt });
  if (conflict) {
    return next(
      new AppError(
        "You already have a session at this time",
        409,
        httpStatusText.FAIL
      )
    );
  }

  const session = await Session.create({
    subscription: subscription._id,
    user: userId,
    startsAt,
    notes,
  });

  subscription.sessionsUsed += 1;
  await subscription.save();

  // Email when plan fully scheduled (with ICS)
  if (subscription.sessionsUsed === subscription.totalSessions) {
    const email = req.user.email;
    const booked = await Session.find({ subscription: subscription._id }).sort(
      "startsAt"
    );
    const startsAtList = booked.map((s) => s.startsAt);
    const { html, text } = generateSessionsConfirmedTemplates({
      recipientName: req.user.name || "User",
      planName: plan.name,
      totalSessions: subscription.totalSessions,
      startsAtList,
    });
    const ics = buildIcsForSessions({
      uidBase: String(subscription._id),
      organizerEmail: process.env.EMAIL_FROM,
      userEmail: email,
      planName: plan.name,
      events: startsAtList.map((d) => ({ startsAt: d, durationMinutes: 60 })),
    });
    const options = {
      email,
      subject: "Your sessions are confirmed",
      html,
      text,
      attachments: [
        {
          filename: "sessions.ics",
          content: ics,
          contentType: "text/calendar; method=PUBLISH",
        },
      ],
    };
    try {
      await sendMail(options);
    } catch (_) {}
  }

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Session created successfully",
    data: {
      session: {
        id: session._id,
        startsAt: session.startsAt,
        status: session.status,
        notes: session.notes,
      },
      sessionsRemaining: subscription.sessionsRemaining,
    },
  });
});
