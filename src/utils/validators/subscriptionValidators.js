import { body, param, query, validationResult } from "express-validator";
import mongoose from "mongoose";

// Validation for creating complete subscription
export const validateCreateCompleteSubscription = [
  body("subscriptionPlanId")
    .notEmpty()
    .withMessage("Subscription plan ID is required")
    .isMongoId()
    .withMessage("Invalid subscription plan ID"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date")
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error("Start date cannot be in the past");
      }
      return true;
    }),

  body("sessions")
    .isArray({ min: 1 })
    .withMessage("Sessions must be a non-empty array"),

  body("sessions.*.date")
    .notEmpty()
    .withMessage("Session date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Session date must be in YYYY-MM-DD format"),

  body("sessions.*.time")
    .notEmpty()
    .withMessage("Session time is required")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Session time must be in HH:MM format"),

  body("sessions.*.notes")
    .optional()
    .isString()
    .withMessage("Session notes must be a string")
    .isLength({ max: 500 })
    .withMessage("Session notes cannot exceed 500 characters"),
];

// Validation for subscription ID parameter
export const validateCompleteSubscriptionId = [
  param("id")
    .notEmpty()
    .withMessage("Subscription ID is required")
    .isMongoId()
    .withMessage("Invalid subscription ID"),
];

// Validation for session ID parameter
export const validateSessionId = [
  param("sessionId")
    .notEmpty()
    .withMessage("Session ID is required")
    .isMongoId()
    .withMessage("Invalid session ID"),
];

// Validation for updating session status
export const validateUpdateSessionStatus = [
  body("status")
    .optional()
    .isIn(["scheduled", "completed", "cancelled", "missed"])
    .withMessage("Invalid session status"),

  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

// Validation for query parameters
export const validateCompleteSubscriptionQuery = [
  query("status")
    .optional()
    .isIn([
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
      "expired",
    ])
    .withMessage("Invalid status filter"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

// Handle validation errors
export const handleCompleteSubscriptionValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "FAIL",
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};
