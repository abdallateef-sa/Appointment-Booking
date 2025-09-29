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
import User from "../models/userModel.js";
import CompleteSubscription from "../models/subscriptionModel.js";

// Require a configured super-admin email in .env as SUPER_ADMIN_EMAIL
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;

export const register = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  if (!SUPER_ADMIN_EMAIL) {
    return next(
      new AppError(
        "Server misconfiguration: SUPER_ADMIN_EMAIL not set",
        500,
        httpStatusText.FAIL
      )
    );
  }

  // Prevent duplicate admin
  const exists = await Admin.findOne({ email });
  if (exists) {
    return next(new AppError("Admin already exists", 409, httpStatusText.FAIL));
  }

  // If no admins exist yet, allow creating only the configured super-admin account
  const anyAdmin = await Admin.findOne();
  if (!anyAdmin) {
    if (email !== SUPER_ADMIN_EMAIL) {
      return next(
        new AppError(
          "Initial admin must be the configured super-admin",
          403,
          httpStatusText.FAIL
        )
      );
    }
    // proceed to create the initial super-admin
  } else {
    // For subsequent admin creations, require the requester to be authenticated
    // and to be the super-admin (the only one allowed to add admins)
    if (!req.user) {
      return next(
        new AppError(
          "Authentication required to create admins",
          401,
          httpStatusText.FAIL
        )
      );
    }

    if (req.user.email !== SUPER_ADMIN_EMAIL) {
      return next(
        new AppError(
          "Only the super-admin can create new admins",
          403,
          httpStatusText.FAIL
        )
      );
    }
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

export const getUsers = asyncWrapper(async (req, res, next) => {
  // Optional query params: page, limit, search (by email or name)
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const { search } = req.query;
  const filter = {};
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ email: regex }, { firstName: regex }, { lastName: regex }];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("firstName lastName email phone country timezone role createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: users.length,
    page,
    total,
    data: { users },
  });
});

// Delete a user and their complete subscriptions (Admin only)
export const deleteUser = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  // Remove user's complete subscriptions
  await CompleteSubscription.deleteMany({ user: user._id });

  // Delete user
  await User.findByIdAndDelete(id);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "User and related subscriptions deleted successfully",
    data: null,
  });
});
