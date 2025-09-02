import user from "../models/userModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import bcrypt from "bcrypt";
import generateJWT from "../utils/generateJWT.js";
import sendMail from "../utils/sendMaile.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import {
  generateOtpEmailTemplate,
  generateOtpTextTemplate,
} from "../utils/emailTemplates.js";

// Step 1: Send OTP to email for verification
export const sendEmailVerification = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  // Check if user already exists and is fully registered
  const existingUser = await user.findOne({ email });

  if (existingUser && existingUser.emailVerified && existingUser.firstName) {
    return next(
      new AppError(
        "This email is already registered. Use /auth/login/send-otp to login.",
        409,
        httpStatusText.FAIL
      )
    );
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  try {
    if (existingUser && !existingUser.emailVerified) {
      // Update existing user with new OTP
      existingUser.emailVerificationCode = hashedOtp;
      existingUser.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await existingUser.save();
    } else {
      // Create new user with email and OTP only
      const newUser = new user({
        email,
        emailVerificationCode: hashedOtp,
        emailVerificationExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
        emailVerified: false,
      });
      await newUser.save();
    }

    // Send OTP email
    const htmlTemplate = generateOtpEmailTemplate(otp, "Valued User");
    const textTemplate = generateOtpTextTemplate(otp, "Valued User");

    await sendMail({
      email,
      subject: "🔐 Email Verification Code - Appointment Booking System",
      html: htmlTemplate,
      text: textTemplate,
    });

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Verification code sent to your email successfully",
      data: {
        email: email,
        expiresIn: "10 minutes",
      },
    });
  } catch (error) {
    return next(
      new AppError(
        "Failed to send verification code. Please try again.",
        500,
        httpStatusText.ERROR
      )
    );
  }
});

// Step 2: Verify OTP (Unified for registration and login)
export const verifyOtp = asyncWrapper(async (req, res, next) => {
  const { email, otp } = req.body;

  const foundUser = await user.findOne({ email });
  if (!foundUser) {
    return next(
      new AppError("Account not found for this email", 404, httpStatusText.FAIL)
    );
  }

  const now = Date.now();

  // Try login OTP first if user is fully registered
  let matchedContext = null;
  if (
    foundUser.firstName &&
    foundUser.loginOtpCode &&
    foundUser.loginOtpExpires &&
    foundUser.loginOtpExpires.getTime() > now
  ) {
    const isLoginOtpValid = await bcrypt.compare(otp, foundUser.loginOtpCode);
    if (isLoginOtpValid) matchedContext = "login";
  }

  // If not login, try registration verification OTP
  if (!matchedContext) {
    if (
      foundUser.emailVerificationCode &&
      foundUser.emailVerificationExpires &&
      foundUser.emailVerificationExpires.getTime() > now
    ) {
      const isRegOtpValid = await bcrypt.compare(
        otp,
        foundUser.emailVerificationCode
      );
      if (isRegOtpValid) matchedContext = "registration";
    }
  }

  if (!matchedContext) {
    return next(
      new AppError("Invalid or expired code", 400, httpStatusText.FAIL)
    );
  }

  if (matchedContext === "login") {
    // Clear login OTP and issue full auth token
    foundUser.loginOtpCode = undefined;
    foundUser.loginOtpExpires = undefined;
    await foundUser.save({ validateBeforeSave: false });

    const token = await generateJWT({
      email: foundUser.email,
      id: foundUser._id,
      role: foundUser.role,
    });

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Logged in successfully",
      data: { token },
    });
  }

  // Registration verification: mark verified and issue temporary token
  foundUser.emailVerified = true;
  foundUser.emailVerificationCode = undefined;
  foundUser.emailVerificationExpires = undefined;
  await foundUser.save({ validateBeforeSave: false });

  const tempToken = await generateJWT({
    email: foundUser.email,
    id: foundUser._id,
    temporary: true,
  });

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message:
      "Email verified successfully. You can now complete your registration.",
    data: {
      email: foundUser.email,
      emailVerified: true,
      tempToken,
      nextStep: "complete-registration",
    },
  });
});

// Step 3: Complete registration with personal information
export const completeRegistration = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, phone, gender, country } = req.body;

  // Get user ID from token
  const userId = req.user.id;
  const userEmail = req.user.email;

  // Find user by ID from token
  const foundUser = await user.findById(userId);

  if (!foundUser) {
    return next(
      new AppError(
        "User not found. Please verify your email first.",
        404,
        httpStatusText.FAIL
      )
    );
  }

  if (!foundUser.emailVerified) {
    return next(
      new AppError("Please verify your email first", 400, httpStatusText.FAIL)
    );
  }

  if (foundUser.firstName) {
    return next(
      new AppError(
        "Registration already completed for this user",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Check if phone already exists for another user
  const existingUserWithPhone = await user.findOne({
    phone,
    _id: { $ne: foundUser._id },
  });

  if (existingUserWithPhone) {
    return next(
      new AppError("Phone number already registered", 409, httpStatusText.FAIL)
    );
  }

  // Update user with personal information
  foundUser.firstName = firstName.trim();
  foundUser.lastName = lastName.trim();
  foundUser.phone = phone;
  foundUser.gender = gender;
  foundUser.country = country.trim();
  foundUser.role = "User"; // Default role

  await foundUser.save();

  // Generate authentication token
  const token = await generateJWT({
    email: foundUser.email,
    id: foundUser._id,
    role: foundUser.role,
  });

  // Set token in cookie
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Registration completed successfully",
    data: {
      user: {
        id: foundUser._id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        phone: foundUser.phone,
        gender: foundUser.gender,
        country: foundUser.country,
        role: foundUser.role,
      },
    },
  });
});

// =====================
// Login with OTP (Passwordless)
// =====================

// Send OTP for login (existing verified users)
export const sendLoginOtp = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  const foundUser = await user.findOne({ email });
  if (!foundUser || !foundUser.emailVerified || !foundUser.firstName) {
    return next(
      new AppError(
        "Account not found or not completed. Please register first.",
        404,
        httpStatusText.FAIL
      )
    );
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  foundUser.loginOtpCode = hashedOtp;
  foundUser.loginOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await foundUser.save({ validateBeforeSave: false });

  const htmlTemplate = generateOtpEmailTemplate(otp, foundUser.firstName);
  const textTemplate = generateOtpTextTemplate(otp, foundUser.firstName);

  await sendMail({
    email,
    subject: "🔐 Login Code - Appointment Booking System",
    html: htmlTemplate,
    text: textTemplate,
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Login code sent to your email.",
    data: { email, expiresIn: "10 minutes" },
  });
});

// // Verify login OTP and issue auth token
// export const verifyLoginOtp = asyncWrapper(async (req, res, next) => {
//   const { email, otp } = req.body;

//   const foundUser = await user.findOne({
//     email,
//     loginOtpExpires: { $gt: Date.now() },
//     loginOtpCode: { $exists: true },
//   });

//   if (!foundUser) {
//     return next(
//       new AppError("Invalid or expired login code", 400, httpStatusText.FAIL)
//     );
//   }

//   const isOtpValid = await bcrypt.compare(otp, foundUser.loginOtpCode);
//   if (!isOtpValid) {
//     return next(new AppError("Invalid login code", 400, httpStatusText.FAIL));
//   }

//   // Clear login OTP
//   foundUser.loginOtpCode = undefined;
//   foundUser.loginOtpExpires = undefined;
//   await foundUser.save({ validateBeforeSave: false });

//   const token = await generateJWT({
//     email: foundUser.email,
//     id: foundUser._id,
//     role: foundUser.role,
//   });

//   res.status(200).json({
//     status: httpStatusText.SUCCESS,
//     message: "Logged in successfully",
//     data: { token },
//   });
// });
