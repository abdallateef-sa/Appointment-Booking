import subscriptionModel from "../models/subscriptionModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";

// Get all booked sessions from all active subscriptions
export const getBookedSessions = asyncWrapper(async (req, res, next) => {
  try {
    // Get all active subscriptions with their sessions
    const activeSubscriptions = await subscriptionModel
      .find({
        status: { $in: ["confirmed", "active"] },
        // Only get future sessions or current ones
        "sessions.startsAt": { $gte: new Date() },
      })
      .select("sessions");

    // Extract all booked slots
    const bookedSlots = [];

    activeSubscriptions.forEach((subscription) => {
      subscription.sessions.forEach((session) => {
        // Only include scheduled or completed sessions (not cancelled)
        if (session.status !== "cancelled" && session.startsAt >= new Date()) {
          bookedSlots.push({
            date: session.date,
            time: session.time,
            startsAt: session.startsAt,
          });
        }
      });
    });

    // Sort by date and time
    bookedSlots.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      results: bookedSlots.length,
      data: {
        bookedSlots: bookedSlots.map((slot) => ({
          date: slot.date,
          time: slot.time,
        })),
      },
    });
  } catch (error) {
    return next(
      new AppError("Failed to fetch booked sessions", 500, httpStatusText.ERROR)
    );
  }
});

// Helper function to check if a specific slot is available
export const checkSlotAvailability = async (date, time) => {
  try {
    const existingBooking = await subscriptionModel.findOne({
      status: { $in: ["confirmed", "active"] },
      sessions: {
        $elemMatch: {
          date: date,
          time: time,
          status: { $ne: "cancelled" },
        },
      },
    });

    return !existingBooking; // true if available, false if booked
  } catch (error) {
    throw new Error("Failed to check slot availability");
  }
};

// Helper function to validate session dates and times
export const validateSessionSlots = async (sessions) => {
  const errors = [];
  const now = new Date();

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    const sessionDateTime = new Date(`${session.date}T${session.time}:00`);

    // Check if session is in the past
    if (sessionDateTime <= now) {
      errors.push(
        `Session ${i + 1}: Cannot book appointments in the past (${
          session.date
        } ${session.time})`
      );
      continue;
    }

    // Check if slot is already booked
    const isAvailable = await checkSlotAvailability(session.date, session.time);
    if (!isAvailable) {
      errors.push(
        `Session ${i + 1}: Time slot ${session.date} at ${
          session.time
        } is already booked`
      );
    }
  }

  return errors;
};
