import express from "express";
import {
  sendEmailVerification,
  verifyOtp,
  completeRegistration,
  sendLoginOtp,
} from "../controllers/authController.js";
import verifyToken from "../middlewares/verifyToken.js";
import {
  validateSendOtp,
  validateVerifyOtp,
  validateCompleteRegistration,
  handleValidationErrors,
} from "../utils/validators/authValidators.js";

const router = express.Router();

// Registration Process (3 Steps)
// Step 1: Send email verification OTP
router.post(
  "/send-otp",
  validateSendOtp,
  handleValidationErrors,
  sendEmailVerification
);

// Step 2: Verify email with OTP
router.post(
  "/verify-otp",
  validateVerifyOtp,
  handleValidationErrors,
  verifyOtp
);

// Step 3: Complete registration with personal info (requires token)
router.post(
  "/complete-registration",
  verifyToken,
  validateCompleteRegistration,
  handleValidationErrors,
  completeRegistration
);

// Login (passwordless via OTP)
router.post(
  "/login/send-otp",
  validateSendOtp,
  handleValidationErrors,
  sendLoginOtp
);

export default router;
