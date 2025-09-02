import { body, validationResult } from "express-validator";
import AppError from "../appError.js";
import httpStatusText from "../httpStatusText.js";

export const validateAdminRegister = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2-100 chars"),
  body("gender")
    .isIn(["Male", "Female"])
    .withMessage("Gender must be Male or Female"),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars"),
  body("country").trim().notEmpty().withMessage("Country is required"),
  body("phone").isMobilePhone("any").withMessage("Valid phone is required"),
];

export const validateAdminLogin = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const validateAdminForgotPassword = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
];

export const validateAdminResetPassword = [
  body("otp").notEmpty().withMessage("OTP is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars"),
];

export const handleAdminValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((e) => ({ field: e.path, message: e.msg, value: e.value }));
    return next(
      new AppError(
        `Validation failed: ${errorMessages.map((x) => x.message).join(", ")}`,
        400,
        httpStatusText.FAIL,
        errorMessages
      )
    );
  }
  next();
};
