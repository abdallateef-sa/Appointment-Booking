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
    // 4. احصل على الدولة من بروفايل المستخدم أو من جسم الطلب (الفرونت يحددها)
    let userCountry = (req.user.country || req.body.userCountry || "").trim();
    if (!userCountry) {
      return next(
        new AppError("User country is required", 400, httpStatusText.FAIL)
      );
    }

    // 5. Calculate subscription dates
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration);

  // 6. Process sessions (الفرونت يحسب startsAtUTC ويرسله لنا)
    const sessionData = [];
    const utcTimesSet = new Set();

    // Group sessions by week for validation (using user's local time)
    const weeklySessionCount = new Map();

    for (const session of sessions) {
  const { date, time, startsAtUTC, notes } = session;

      // Require startsAtUTC from frontend
      if (!startsAtUTC) {
        return next(
          new AppError(
            "Each session must include startsAtUTC (ISO datetime in UTC)",
            400,
            httpStatusText.FAIL
          )
        );
      }

      try {
        const utcDateTime = new Date(startsAtUTC);
        if (isNaN(utcDateTime.getTime())) {
          return next(
            new AppError("Invalid startsAtUTC datetime", 400, httpStatusText.FAIL)
          );
        }

        // Check for duplicate UTC times
        const utcTimeKey = utcDateTime.getTime();
        if (utcTimesSet.has(utcTimeKey)) {
          return next(
            new AppError(
              "Duplicate session times are not allowed",
              400,
              httpStatusText.FAIL
            )
          );
        }
        utcTimesSet.add(utcTimeKey);

        // Count sessions per week (using user's local time for week calculation)
        const userDateTime = new Date(`${date}T${time}:00`);
        const weekStart = getWeekStart(userDateTime).getTime();
        weeklySessionCount.set(
          weekStart,
          (weeklySessionCount.get(weekStart) || 0) + 1
        );

        sessionData.push({
          startsAtUTC: utcDateTime,
          userLocalDate: date,
          userLocalTime: time,
          userCountry: userCountry,
          notes: notes?.trim() || "",
        });
      } catch (error) {
        return next(
          new AppError(
            `Invalid date/time format for session: ${date} ${time}`,
            400,
            httpStatusText.FAIL
          )
        );
      }
    }

    // 7. Validate weekly session limits
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

    // 8. Check for conflicts with existing sessions using UTC times
    const existingSessions = await CompleteSubscription.find({
      user: userId,
      status: { $in: ["confirmed", "active"] },
      "sessions.startsAtUTC": {
        $in: Array.from(utcTimesSet).map((t) => new Date(t)),
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

    // 9. Create the complete subscription
    const completeSubscription = await CompleteSubscription.create({
      user: userId,
      userEmail,
      userCountry,
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

    // 10. Send confirmation email with ICS file
    try {
      // Sort sessions by UTC time for email display
      const sortedUTCSessions = sessionData
        .map((s) => s.startsAtUTC)
        .sort((a, b) => a - b);

      // Use the stored session local date/time from the created subscription for email display
      // This ensures the email shows exactly what was saved in the DB (userLocalDate / userLocalTime)
      const displaySessions = (completeSubscription.sessions || [])
        .slice()
        .sort((a, b) => new Date(a.startsAtUTC) - new Date(b.startsAtUTC))
        .map((s) => ({
          startsAtUTC: s.startsAtUTC,
          userLocalDate: s.userLocalDate,
          userLocalTime: s.userLocalTime,
          userCountry: s.userCountry,
          formatted: `${s.userLocalDate} ${s.userLocalTime}`,
        }));

      // Use firstName if available, otherwise fallback to email part
      const userName = req.user.firstName || req.user.email.split("@")[0];

      const { html, text } = generateSessionsConfirmedTemplates({
        recipientName: userName,
        planName: plan.name,
        totalSessions: plan.sessionsPerMonth,
        planPrice: plan.price,
        planCurrency: plan.currency || "USD",
        startsAtList: sortedUTCSessions, // Use UTC times for ICS generation
        displaySessions, // Use DB-stored local date/time for email body
        userCountry,
      });

      const ics = buildIcsForSessions({
        uidBase: String(completeSubscription._id),
        organizerEmail: process.env.EMAIL_FROM,
        userEmail,
        planName: plan.name,
        events: sortedUTCSessions.map((startsAtUTC) => ({
          startsAt: startsAtUTC, // ICS should use UTC times
          durationMinutes: 30,
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

// @desc Get user's complete subscriptions with timezone conversion
// @route GET /api/v1/user/complete-subscriptions
// @access Private
export const getMyCompleteSubscriptions = asyncWrapper(
  async (req, res, next) => {
    const userId = req.user.id;
    const { displayCountry } = req.query; // Optional: for timezone display
    const userCountry = displayCountry || req.user.country; // Use query param or user's country

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
          sessions: sub.sessions.map((session) => {
            // Convert UTC time to display timezone if available
            if (session.startsAtUTC && userCountry) {
              const displayed = fromUTC(session.startsAtUTC, userCountry);
              return {
                id: session._id,
                date: displayed.date,
                time: displayed.time,
                startsAtUTC: session.startsAtUTC, // Keep UTC for reference
                displayTime: displayed.formatted,
                timezone: displayed.timezone,
                status: session.status,
                notes: session.notes,
              };
            } else {
              // Fallback for old data format or missing country
              return {
                id: session._id,
                date: session.date || null,
                time: session.time || null,
                startsAt: session.startsAt || null, // Legacy field
                startsAtUTC: session.startsAtUTC || null,
                status: session.status,
                notes: session.notes,
              };
            }
          }),
          displayCountry: userCountry,
        })),
      },
    });
  }
);
