import { body, validationResult } from "express-validator";
import AppError from "../appError.js";
import httpStatusText from "../httpStatusText.js";

// Email validation for sending OTP
export const validateSendOtp = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .trim(),
];

// OTP verification validation
export const validateVerifyOtp = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .trim(),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];

// Complete registration validation
export const validateCompleteRegistration = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Zأ-ي\s]+$/)
    .withMessage("First name should contain only letters and spaces")
    .trim(),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Zأ-ي\s]+$/)
    .withMessage("Last name should contain only letters and spaces")
    .trim(),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["Male", "Female"])
    .withMessage("Gender must be either 'Male' or 'Female'"),

  body("country")
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters")
    .trim(),
];

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return next(
      new AppError(
        `Validation failed: ${errorMessages
          .map((err) => err.message)
          .join(", ")}`,
        400,
        httpStatusText.FAIL,
        errorMessages
      )
    );
  }

  next();
};
