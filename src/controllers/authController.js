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

// In-memory storage for temporary OTP verification and email verification (in production use Redis)
const tempOtpStorage = new Map();
const verifiedEmailsStorage = new Map(); // Store verified emails temporarily

// Clean expired data every 5 minutes
setInterval(() => {
  const now = Date.now();

  // Clean expired OTPs
  for (const [email, data] of tempOtpStorage.entries()) {
    if (data.expires < now) {
      tempOtpStorage.delete(email);
    }
  }

  // Clean expired verified emails (expire after 30 minutes)
  for (const [email, data] of verifiedEmailsStorage.entries()) {
    if (data.expires < now) {
      verifiedEmailsStorage.delete(email);
    }
  }
}, 5 * 60 * 1000);

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
    // Store OTP temporarily in memory (not in database)
    tempOtpStorage.set(email, {
      hashedOtp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      type: "registration",
    });

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
    // Clean up temp storage on error
    tempOtpStorage.delete(email);
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

  // Check if user exists in database (for login)
  const existingUser = await user.findOne({ email });

  const now = Date.now();
  let matchedContext = null;

  // Try login OTP first if user is fully registered
  if (
    existingUser &&
    existingUser.firstName &&
    existingUser.loginOtpCode &&
    existingUser.loginOtpExpires &&
    existingUser.loginOtpExpires.getTime() > now
  ) {
    const isLoginOtpValid = await bcrypt.compare(
      otp,
      existingUser.loginOtpCode
    );
    if (isLoginOtpValid) matchedContext = "login";
  }

  // If not login, check temporary registration OTP storage
  if (!matchedContext) {
    const tempOtpData = tempOtpStorage.get(email);
    if (
      tempOtpData &&
      tempOtpData.expires > now &&
      tempOtpData.type === "registration"
    ) {
      const isRegOtpValid = await bcrypt.compare(otp, tempOtpData.hashedOtp);
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
    existingUser.loginOtpCode = undefined;
    existingUser.loginOtpExpires = undefined;
    await existingUser.save({ validateBeforeSave: false });

    const token = await generateJWT({
      email: existingUser.email,
      id: existingUser._id,
      role: existingUser.role,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
    });

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Logged in successfully",
      data: { token },
    });
  }

  // Registration verification: Store verified email in memory (don't create user yet)
  verifiedEmailsStorage.set(email, {
    verified: true,
    expires: Date.now() + 30 * 60 * 1000, // 30 minutes to complete registration
  });

  // Clear temporary OTP storage
  tempOtpStorage.delete(email);

  // Create temporary token with email only (no user ID yet)
  const tempToken = await generateJWT({
    email: email,
    temporary: true,
    emailVerified: true,
  });

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message:
      "Email verified successfully. You can now complete your registration.",
    data: {
      email: email,
      emailVerified: true,
      tempToken,
      nextStep: "complete-registration",
    },
  });
});

// Step 3: Complete registration with personal information
export const completeRegistration = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, phone, gender, country } = req.body;

  // Get email from token (no user ID yet since user doesn't exist in DB)
  const userEmail = req.user.email;
  const isTemporary = req.user.temporary;
  const emailVerified = req.user.emailVerified;

  // Verify this is a temporary token for registration
  if (!isTemporary || !emailVerified) {
    return next(
      new AppError(
        "Invalid token. Please verify your email first.",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Check if email was verified in memory
  const verifiedEmailData = verifiedEmailsStorage.get(userEmail);
  if (!verifiedEmailData || verifiedEmailData.expires < Date.now()) {
    return next(
      new AppError(
        "Email verification expired. Please verify your email again.",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Check if user already exists in database
  const existingUser = await user.findOne({ email: userEmail });
  if (existingUser) {
    return next(
      new AppError(
        "Email already registered. Use login instead.",
        409,
        httpStatusText.FAIL
      )
    );
  }

  // Check if phone already exists
  const existingUserWithPhone = await user.findOne({ phone });
  if (existingUserWithPhone) {
    return next(
      new AppError("Phone number already registered", 409, httpStatusText.FAIL)
    );
  }

  // Create new user in database (ONLY NOW!)
  const newUser = new user({
    email: userEmail,
    emailVerified: true,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: phone,
    gender: gender,
    country: country.trim(),
    role: "User",
  });

  await newUser.save();

  // Clear verified email from memory storage
  verifiedEmailsStorage.delete(userEmail);

  // Generate final authentication token
  const token = await generateJWT({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Registration completed successfully",
    data: {
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
        country: newUser.country,
        role: newUser.role,
      },
    },
  });
});

// =====================
// Login with OTP (Passwordless)
// =====================// Send OTP for login (existing verified users)
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
