import subscriptionModel from "../models/subscriptionModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";

// Get all booked sessions
export const getBookedSessions = asyncWrapper(async (req, res, next) => {
  try {
    const { displayCountry } = req.query; // Country for timezone display

    // Get all active subscriptions with their sessions
    const activeSubscriptions = await subscriptionModel
      .find({
        status: { $in: ["confirmed", "active"] },
        "sessions.startsAtUTC": { $gte: new Date() }, // Future sessions only
      })
      .select("sessions userCountry");

    // Extract all booked slots in UTC
    const bookedSlots = [];

    activeSubscriptions.forEach((subscription) => {
      subscription.sessions.forEach((session) => {
        if (
          session.status !== "cancelled" &&
          session.startsAtUTC >= new Date()
        ) {
          bookedSlots.push({
            utcTime: session.startsAtUTC,
            userCountry: session.userCountry,
            originalUserDate: session.userLocalDate,
            originalUserTime: session.userLocalTime,
          });
        }
      });
    });

    // Sort by UTC time
    bookedSlots.sort((a, b) => new Date(a.utcTime) - new Date(b.utcTime));

    // Convert to display timezone if requested
    let displaySlots = bookedSlots;
    if (displayCountry) {
      displaySlots = bookedSlots.map((slot) => {
        const displayed = fromUTC(slot.utcTime, displayCountry);
        return {
          date: displayed.date,
          time: displayed.time,
          timezone: displayed.timezone,
          formatted: displayed.formatted,
          utcTime: slot.utcTime,
        };
      });
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      results: bookedSlots.length,
      data: {
        bookedSlots: displaySlots,
        displayCountry: displayCountry || null,
        timezone: displayCountry
          ? fromUTC(new Date(), displayCountry).timezone
          : "UTC",
      },
    });
  } catch (error) {
    console.error("Error in getBookedSessions:", error);
    return next(
      new AppError("Failed to fetch booked sessions", 500, httpStatusText.ERROR)
    );
  }
});

// Helper function to check if a UTC slot is available
export const checkSlotAvailability = async (utcDateTime) => {
  try {
    const existingBooking = await subscriptionModel.findOne({
      status: { $in: ["confirmed", "active"] },
      sessions: {
        $elemMatch: {
          startsAtUTC: utcDateTime,
          status: { $ne: "cancelled" },
        },
      },
    });

    return !existingBooking; // true if available, false if booked
  } catch (error) {
    throw new Error("Failed to check slot availability");
  }
};

// Helper function to validate session slots with timezone conversion
export const validateSessionSlots = async (sessions, userCountry) => {
  const errors = [];
  const now = new Date();
  const bookedUTCTimes = [];

  // Get existing bookings to check conflicts
  const existingBookings = await subscriptionModel
    .find({
      status: { $in: ["confirmed", "active"] },
      "sessions.status": { $ne: "cancelled" },
    })
    .select("sessions.startsAtUTC");

  existingBookings.forEach((booking) => {
    booking.sessions.forEach((session) => {
      if (session.startsAtUTC) {
        bookedUTCTimes.push(session.startsAtUTC);
      }
    });
  });

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];

    try {
      // Convert user's local time to UTC
      const { utcDateTime } = toUTC(session.date, session.time, userCountry);

      // Check if session is in the past
      if (utcDateTime <= now) {
        errors.push(
          `Session ${i + 1}: Cannot book appointments in the past (${
            session.date
          } ${session.time})`
        );
        continue;
      }

      // Check if slot is available
      if (!isSlotAvailable(utcDateTime, bookedUTCTimes)) {
        errors.push(
          `Session ${i + 1}: Time slot ${session.date} at ${
            session.time
          } is already booked`
        );
      }
    } catch (error) {
      errors.push(
        `Session ${i + 1}: Invalid date/time format (${session.date} ${
          session.time
        })`
      );
    }
  }

  return errors;
};

// Get available time slots for a date range
export const getAvailableSlots = asyncWrapper(async (req, res, next) => {
  try {
    const { startDate, endDate, displayCountry } = req.query;

    if (!startDate || !displayCountry) {
      return next(
        new AppError(
          "Start date and display country are required",
          400,
          httpStatusText.FAIL
        )
      );
    }

    const finalEndDate = endDate || startDate; // Default to same day if no end date

    // Get existing booked UTC times
    const existingBookings = await subscriptionModel
      .find({
        status: { $in: ["confirmed", "active"] },
        "sessions.status": { $ne: "cancelled" },
      })
      .select("sessions.startsAtUTC");

    const bookedUTCTimes = [];
    existingBookings.forEach((booking) => {
      booking.sessions.forEach((session) => {
        if (session.startsAtUTC) {
          bookedUTCTimes.push(session.startsAtUTC);
        }
      });
    });

    // Generate available slots
    const availableSlots = generateAvailableSlots(
      startDate,
      finalEndDate,
      displayCountry,
      bookedUTCTimes
    );

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      results: availableSlots.length,
      data: {
        availableSlots,
        dateRange: { startDate, endDate: finalEndDate },
        displayCountry,
        timezone: availableSlots.length > 0 ? availableSlots[0].timezone : null,
      },
    });
  } catch (error) {
    console.error("Error in getAvailableSlots:", error);
    return next(
      new AppError("Failed to fetch available slots", 500, httpStatusText.ERROR)
    );
  }
});
