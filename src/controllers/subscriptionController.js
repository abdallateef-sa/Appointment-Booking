import CompleteSubscription from "../models/subscriptionModel.js";
import SubscriptionPlan from "../models/planModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import sendMail from "../utils/sendMaile.js";
import {
  buildIcsForSessions,
  generateSessionsConfirmedTemplates,
} from "../utils/emailTemplates.js";
import { validateSessionSlots } from "./sessionsController.js";

// Helper function to convert date and time strings to Date object
function toStartsAt(dateStr, timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(dateStr);
  d.setHours(h, m, 0, 0);
  return d;
}

// Helper function to get week start (Monday)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // Monday as week start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// @desc Create complete subscription with all sessions at once
// @route POST /api/v1/user/complete-subscription
// @access Private
export const createCompleteSubscription = asyncWrapper(
  async (req, res, next) => {
    const { subscriptionPlanId, startDate, sessions } = req.body;
    // sessions: [{ date: "2025-01-15", time: "14:30", notes: "optional" }, ...]

    const userId = req.user.id;
    const userEmail = req.user.email;

    // 1. Validate subscription plan
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

    // 2. Check if user already has an active subscription to this plan
    const existingSubscription = await CompleteSubscription.findOne({
      user: userId,
      subscriptionPlan: subscriptionPlanId,
      status: { $in: ["confirmed", "active"] },
    });

    if (existingSubscription) {
      return next(
        new AppError(
          "You already have an active subscription to this plan",
          409,
          httpStatusText.FAIL
        )
      );
    }

    // 3. Validate sessions count matches plan
    if (!sessions || sessions.length !== plan.sessionsPerMonth) {
      return next(
        new AppError(
          `You must schedule exactly ${plan.sessionsPerMonth} sessions for this plan`,
          400,
          httpStatusText.FAIL
        )
      );
    }

    // 4. NEW: Validate session slots (past dates and conflicts)
    const sessionValidationErrors = await validateSessionSlots(sessions);
    if (sessionValidationErrors.length > 0) {
      return next(
        new AppError(
          `Session validation failed: ${sessionValidationErrors.join("; ")}`,
          400,
          httpStatusText.FAIL
        )
      );
    }

    // 5. Calculate subscription dates
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration);

    // 5. Validate and process sessions
    const now = new Date();
    const sessionData = [];
    const startsAtSet = new Set();

    // Group sessions by week for validation
    const weeklySessionCount = new Map();

    for (const session of sessions) {
      const { date, time, notes } = session;

      // Validate date and time format
      if (!date || !time) {
        return next(
          new AppError(
            "Each session must have date and time",
            400,
            httpStatusText.FAIL
          )
        );
      }

      const startsAt = toStartsAt(date, time);

      // Check for past dates
      if (startsAt < now) {
        return next(
          new AppError(
            "Session times cannot be in the past",
            400,
            httpStatusText.FAIL
          )
        );
      }

      // Check if session is within subscription window
      if (startsAt < start || startsAt > end) {
        return next(
          new AppError(
            "All sessions must be within the subscription period",
            400,
            httpStatusText.FAIL
          )
        );
      }

      // Check for duplicate times
      const timeKey = startsAt.getTime();
      if (startsAtSet.has(timeKey)) {
        return next(
          new AppError(
            "Duplicate session times are not allowed",
            400,
            httpStatusText.FAIL
          )
        );
      }
      startsAtSet.add(timeKey);

      // Count sessions per week
      const weekStart = getWeekStart(startsAt).getTime();
      weeklySessionCount.set(
        weekStart,
        (weeklySessionCount.get(weekStart) || 0) + 1
      );

      sessionData.push({
        date,
        time,
        startsAt,
        notes: notes?.trim() || "",
      });
    }

    // 6. Validate weekly session limits
    for (const [, weekCount] of weeklySessionCount) {
      if (weekCount > plan.sessionsPerWeek) {
        return next(
          new AppError(
            `Cannot schedule more than ${plan.sessionsPerWeek} sessions per week`,
            400,
            httpStatusText.FAIL
          )
        );
      }
    }

    // 7. Check for conflicts with user's existing sessions
    const existingSessions = await CompleteSubscription.find({
      user: userId,
      status: { $in: ["confirmed", "active"] },
      "sessions.startsAt": {
        $in: Array.from(startsAtSet).map((t) => new Date(t)),
      },
    });

    if (existingSessions.length > 0) {
      return next(
        new AppError(
          "You already have sessions scheduled at some of the selected times",
          409,
          httpStatusText.FAIL
        )
      );
    }

    // 8. Create the complete subscription
    const completeSubscription = await CompleteSubscription.create({
      user: userId,
      userEmail,
      subscriptionPlan: subscriptionPlanId,
      planName: plan.name,
      planPrice: plan.price,
      planCurrency: plan.currency,
      startDate: start,
      endDate: end,
      totalSessions: plan.sessionsPerMonth,
      sessionsPerWeek: plan.sessionsPerWeek,
      sessions: sessionData,
      status: "confirmed",
    });

    // 9. Send confirmation email with ICS file
    try {
      const sortedSessions = sessionData
        .map((s) => s.startsAt)
        .sort((a, b) => a - b);

      const { html, text } = generateSessionsConfirmedTemplates({
        recipientName: req.user.name || "User",
        planName: plan.name,
        totalSessions: plan.sessionsPerMonth,
        startsAtList: sortedSessions,
      });

      const ics = buildIcsForSessions({
        uidBase: String(completeSubscription._id),
        organizerEmail: process.env.EMAIL_FROM,
        userEmail,
        planName: plan.name,
        events: sortedSessions.map((startsAt) => ({
          startsAt,
          durationMinutes: 60,
        })),
      });

      const emailOptions = {
        email: userEmail,
        subject: `Subscription Confirmed - ${plan.name}`,
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

      await sendMail(emailOptions);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the subscription creation if email fails
    }

    // 10. Return success response
    res.status(201).json({
      status: httpStatusText.SUCCESS,
      message: "Subscription created successfully with all sessions scheduled",
      data: {
        subscription: {
          id: completeSubscription._id,
          planName: completeSubscription.planName,
          planPrice: completeSubscription.planPrice,
          planCurrency: completeSubscription.planCurrency,
          startDate: completeSubscription.startDate,
          endDate: completeSubscription.endDate,
          totalSessions: completeSubscription.totalSessions,
          sessionsScheduled: completeSubscription.sessions.length,
          status: completeSubscription.status,
          nextSession: completeSubscription.nextSession,
          sessions: completeSubscription.sessions.map((session) => ({
            id: session._id,
            date: session.date,
            time: session.time,
            startsAt: session.startsAt,
            status: session.status,
            notes: session.notes,
          })),
        },
      },
    });
  }
);

// @desc Get user's complete subscriptions (simplified)
// @route GET /api/v1/user/complete-subscriptions
// @access Private
export const getMyCompleteSubscriptions = asyncWrapper(
  async (req, res, next) => {
    const userId = req.user.id;

    const subscriptions = await CompleteSubscription.find({ user: userId })
      .populate("subscriptionPlan", "name description features")
      .sort("-createdAt")
      .select("-__v");

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      results: subscriptions.length,
      data: {
        subscriptions: subscriptions.map((sub) => ({
          id: sub._id,
          planName: sub.planName,
          planPrice: sub.planPrice,
          planCurrency: sub.planCurrency,
          startDate: sub.startDate,
          endDate: sub.endDate,
          totalSessions: sub.totalSessions,
          sessionsCompleted: sub.sessionsCompleted,
          sessionsRemaining: sub.sessionsRemaining,
          status: sub.status,
          nextSession: sub.nextSession,
          createdAt: sub.createdAt,
          sessions: sub.sessions.map((session) => ({
            id: session._id,
            date: session.date,
            time: session.time,
            startsAt: session.startsAt,
            status: session.status,
            notes: session.notes,
          })),
        })),
      },
    });
  }
);
