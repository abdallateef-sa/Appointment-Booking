import { body } from "express-validator";

export const validateSubscribeToPlan = [
  body("subscriptionPlanId")
    .isMongoId()
    .withMessage("Valid subscription plan ID is required"),
  body("startDate")
    .isISO8601()
    .withMessage("Valid start date is required")
    .custom((value) => {
      const d = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) throw new Error("Start date cannot be in the past");
      return true;
    }),
];

export const validateBulkSessions = [
  body("subscriptionId")
    .isMongoId()
    .withMessage("Valid subscription ID is required"),
  body("sessions")
    .isArray({ min: 1 })
    .withMessage("sessions must be a non-empty array"),
  body("sessions.*.date")
    .isISO8601()
    .withMessage("Each session must include a valid date"),
  body("sessions.*.time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Each session time must be in HH:MM format"),
];

export const validateCreateSession = [
  body("subscriptionId")
    .isMongoId()
    .withMessage("Valid subscription ID is required"),
  body("date").isISO8601().withMessage("Valid date is required"),
  body("time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Time must be in HH:MM format"),
  body("notes").optional().isString().trim(),
];
