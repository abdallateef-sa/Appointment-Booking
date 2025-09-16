/**
 * Timezone Utility Functions using Luxon
 *
 * Core concept:
 * - All times stored in database as UTC
 * - Users/Admins see times in their local timezone based on their country
 * - Convert: User Local Time → UTC → Store in DB
 * - Display: UTC from DB → User Local Time → Show to user
 */

import { DateTime } from "luxon";
import { getTimezoneForCountry } from "./countryTimezone.js";

/**
 * Convert user's local time to UTC for database storage
 * @param {string} date - Date in YYYY-MM-DD format (user's local timezone)
 * @param {string} time - Time in HH:MM format (user's local timezone)
 * @param {string} userCountry - User's country
 * @returns {Object} - { utcDateTime, userTimezone, originalDate, originalTime }
 */
export function toUTC(date, time, userCountry) {
  try {
    const timezone = getTimezoneForCountry(userCountry);

    // Create DateTime in user's timezone
    const userDateTime = DateTime.fromFormat(
      `${date} ${time}`,
      "yyyy-MM-dd HH:mm",
      { zone: timezone }
    );

    if (!userDateTime.isValid) {
      throw new Error(`Invalid date/time: ${userDateTime.invalidReason}`);
    }

    // Convert to UTC
    const utcDateTime = userDateTime.toUTC();

    return {
      utcDateTime: utcDateTime.toJSDate(), // JavaScript Date object for MongoDB
      userTimezone: timezone,
      originalDate: date,
      originalTime: time,
      utcISO: utcDateTime.toISO(),
    };
  } catch (error) {
    throw new Error(`Failed to convert to UTC: ${error.message}`);
  }
}

/**
 * Convert UTC time from database to user's local timezone for display
 * @param {Date} utcDate - UTC Date from database
 * @param {string} displayCountry - Country for display timezone
 * @returns {Object} - { date, time, timezone, dateTime, formatted }
 */
export function fromUTC(utcDate, displayCountry) {
  try {
    const timezone = getTimezoneForCountry(displayCountry);

    // Create DateTime from UTC Date
    const utcDateTime = DateTime.fromJSDate(utcDate, { zone: "utc" });

    if (!utcDateTime.isValid) {
      throw new Error(`Invalid UTC date: ${utcDateTime.invalidReason}`);
    }

    // Convert to display timezone
    const localDateTime = utcDateTime.setZone(timezone);

    return {
      date: localDateTime.toFormat("yyyy-MM-dd"),
      time: localDateTime.toFormat("HH:mm"),
      timezone: timezone,
      dateTime: localDateTime.toFormat("yyyy-MM-dd HH:mm"),
      formatted: localDateTime.toFormat("dd/MM/yyyy HH:mm"),
      jsDate: localDateTime.toJSDate(),
    };
  } catch (error) {
    throw new Error(`Failed to convert from UTC: ${error.message}`);
  }
}

/**
 * Validate if a time is reasonable for booking (not in the past, within business hours)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @param {string} userCountry - User's country
 * @returns {Object} - { isValid, reason, utcDateTime }
 */
export function validateBookingTime(date, time, userCountry) {
  try {
    const { utcDateTime } = toUTC(date, time, userCountry);
    const now = new Date();

    // Check if in the past
    if (utcDateTime <= now) {
      return {
        isValid: false,
        reason: "Cannot book appointments in the past",
        utcDateTime,
      };
    }

    // Check business hours (7 AM to 7 PM in any timezone)
    const userTimezone = getTimezoneForCountry(userCountry);
    const userDateTime = DateTime.fromFormat(
      `${date} ${time}`,
      "yyyy-MM-dd HH:mm",
      { zone: userTimezone }
    );
    const hour = userDateTime.hour;

    if (hour < 7 || hour >= 19) {
      return {
        isValid: false,
        reason: "Booking hours are 7:00 AM to 7:00 PM",
        utcDateTime,
      };
    }

    return {
      isValid: true,
      reason: "Valid booking time",
      utcDateTime,
    };
  } catch (error) {
    return {
      isValid: false,
      reason: `Validation error: ${error.message}`,
      utcDateTime: null,
    };
  }
}

/**
 * Check if a UTC time slot conflicts with existing bookings
 * @param {Date} proposedUTC - Proposed UTC time
 * @param {Array} existingUTCTimes - Array of existing UTC Date objects
 * @param {number} bufferMinutes - Buffer time in minutes (default: 30)
 * @returns {boolean} - true if available, false if conflict
 */
export function isSlotAvailable(
  proposedUTC,
  existingUTCTimes = [],
  bufferMinutes = 30
) {
  const proposedTime = proposedUTC.getTime();
  const buffer = bufferMinutes * 60 * 1000; // Convert to milliseconds

  return !existingUTCTimes.some((existingTime) => {
    const existingTimeMs = new Date(existingTime).getTime();
    return Math.abs(proposedTime - existingTimeMs) < buffer;
  });
}

/**
 * Generate available time slots for a date range in user's timezone
 * @param {string} startDate - Start date in YYYY-MM-DD
 * @param {string} endDate - End date in YYYY-MM-DD
 * @param {string} displayCountry - Country for display
 * @param {Array} bookedUTCTimes - Array of booked UTC times
 * @returns {Array} - Array of available slots
 */
export function generateAvailableSlots(
  startDate,
  endDate,
  displayCountry,
  bookedUTCTimes = []
) {
  const slots = [];
  const timezone = getTimezoneForCountry(displayCountry);

  try {
    const start = DateTime.fromFormat(startDate, "yyyy-MM-dd", {
      zone: timezone,
    });
    const end = DateTime.fromFormat(endDate, "yyyy-MM-dd", { zone: timezone });

    let currentDate = start;

    while (currentDate <= end) {
      // Generate slots for business hours (7 AM - 7 PM)
      for (let hour = 7; hour < 19; hour++) {
        for (const minute of [0, 30]) {
          const slotDateTime = currentDate.set({
            hour,
            minute,
            second: 0,
            millisecond: 0,
          });

          // Convert to UTC to check conflicts
          const { utcDateTime } = toUTC(
            slotDateTime.toFormat("yyyy-MM-dd"),
            slotDateTime.toFormat("HH:mm"),
            displayCountry
          );

          // Check if slot is available
          if (isSlotAvailable(utcDateTime, bookedUTCTimes)) {
            slots.push({
              date: slotDateTime.toFormat("yyyy-MM-dd"),
              time: slotDateTime.toFormat("HH:mm"),
              utcDateTime: utcDateTime,
              timezone: timezone,
              formatted: slotDateTime.toFormat("dd/MM/yyyy HH:mm"),
            });
          }
        }
      }

      currentDate = currentDate.plus({ days: 1 });
    }

    return slots;
  } catch (error) {
    console.error("Error generating available slots:", error);
    return [];
  }
}

/**
 * Get user's timezone from their country
 * @param {string} country - User's country
 * @returns {string} - IANA timezone string
 */
export function getUserTimezone(country) {
  return getTimezoneForCountry(country);
}

/**
 * Format UTC time for different display purposes
 * @param {Date} utcDate - UTC date from database
 * @param {string} displayCountry - Country for display
 * @param {string} format - Display format ('short', 'long', 'time-only')
 * @returns {string} - Formatted time string
 */
export function formatTimeForDisplay(
  utcDate,
  displayCountry,
  format = "short"
) {
  try {
    const timezone = getTimezoneForCountry(displayCountry);
    const localDateTime = DateTime.fromJSDate(utcDate, { zone: "utc" }).setZone(
      timezone
    );

    switch (format) {
      case "short":
        return localDateTime.toFormat("dd/MM/yyyy HH:mm");
      case "long":
        return localDateTime.toFormat("EEEE, dd MMMM yyyy 'at' HH:mm");
      case "time-only":
        return localDateTime.toFormat("HH:mm");
      case "date-only":
        return localDateTime.toFormat("dd/MM/yyyy");
      default:
        return localDateTime.toFormat("dd/MM/yyyy HH:mm");
    }
  } catch (error) {
    return "Invalid date";
  }
}

export default {
  toUTC,
  fromUTC,
  validateBookingTime,
  isSlotAvailable,
  generateAvailableSlots,
  getUserTimezone,
  formatTimeForDisplay,
};
