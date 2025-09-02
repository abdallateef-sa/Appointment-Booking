import Admin from "../models/adminModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import generateToken from "../utils/generateJWT.js";
import SendEmail from "../utils/sendMaile.js";
import {
  generateAdminOtpTemplate,
  generateAdminOtpTextTemplate,
} from "../utils/emailTemplates.js";

export const register = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;
  const exists = await Admin.findOne({ email });
  if (exists) {
    return next(new AppError("Admin already exists", 409, httpStatusText.FAIL));
  }

  const admin = await Admin.create(req.body);
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Admin registered successfully",
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        gender: admin.gender,
        country: admin.country,
        phone: admin.phone,
        role: admin.role,
      },
    },
  });
});

export const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin)
    return next(new AppError("Invalid credentials", 401, httpStatusText.FAIL));
  const ok = await admin.comparePassword(password);
  if (!ok)
    return next(new AppError("Invalid credentials", 401, httpStatusText.FAIL));

  const token = await generateToken({
    id: admin._id,
    email: admin.email,
    role: admin.role,
  });
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Logged in successfully",
    data: { token },
  });
});

export const logout = asyncWrapper(async (req, res) => {
  res.clearCookie("token"); // if using cookies
  res.status(200).json({ message: "Logged out successfully" });
});

export const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin)
    return next(
      new AppError("No admin with that email", 404, httpStatusText.FAIL)
    );

  const otp = admin.generateOTP();
  await admin.save({ validateBeforeSave: false });

  const html = generateAdminOtpTemplate(otp, admin.name);
  const text = generateAdminOtpTextTemplate(otp, admin.name);

  await SendEmail({
    email,
    subject: "Admin Password Reset OTP - Appointment Booking System",
    html,
    text,
  });

  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, message: "OTP sent to email" });
});

export const resetPassword = asyncWrapper(async (req, res, next) => {
  const { otp, password, email } = req.body;
  const admin = await Admin.findOne({
    email,
    otpExpires: { $gt: Date.now() },
  }).select("+password +otp");
  if (!admin)
    return next(
      new AppError("Invalid or expired OTP", 400, httpStatusText.FAIL)
    );

  const isValidOTP = admin.verifyOTP(otp);
  if (!isValidOTP)
    return next(new AppError("Invalid OTP", 400, httpStatusText.FAIL));

  admin.password = password;
  admin.otp = undefined;
  admin.otpExpires = undefined;
  await admin.save();

  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, message: "Password updated" });
});
