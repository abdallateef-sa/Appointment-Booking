import { body, param } from "express-validator";

export const validateCreateSubscriptionPlan = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Plan name must be 2-100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("sessionsPerMonth")
    .isInt({ min: 1, max: 100 })
    .withMessage("Sessions per month must be between 1 and 100"),

  body("sessionsPerWeek")
    .isInt({ min: 1, max: 7 })
    .withMessage("Sessions per week must be between 1 and 7"),

  body("price")
    .isFloat({ min: 0, max: 100000 })
    .withMessage("Price must be between 0 and 100,000"),

  body("currency")
    .optional()
    .isIn(["EGP", "USD", "EUR"])
    .withMessage("Currency must be EGP, USD, or EUR"),

  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),

  body("features.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Each feature must be 1-100 characters"),

  body("duration")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Duration must be between 1 and 365 days"),
];

export const validateUpdateSubscriptionPlan = [
  param("id").isMongoId().withMessage("Invalid subscription plan ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Plan name must be 2-100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("sessionsPerMonth")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Sessions per month must be between 1 and 100"),

  body("sessionsPerWeek")
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage("Sessions per week must be between 1 and 7"),

  body("price")
    .optional()
    .isFloat({ min: 0, max: 100000 })
    .withMessage("Price must be between 0 and 100,000"),

  body("currency")
    .optional()
    .isIn(["EGP", "USD", "EUR"])
    .withMessage("Currency must be EGP, USD, or EUR"),

  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),

  body("features.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Each feature must be 1-100 characters"),

  body("duration")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Duration must be between 1 and 365 days"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const validateSubscriptionPlanId = [
  param("id").isMongoId().withMessage("Invalid subscription plan ID"),
];
