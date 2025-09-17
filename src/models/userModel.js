import mongoose from "mongoose";
import validator from "validator";
import { getTimezoneForCountry } from "../utils/countryTimezone.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: function () {
        return this.emailVerified; // Required only after email verification
      },
      trim: true,
    },
    lastName: {
      type: String,
      required: function () {
        return this.emailVerified; // Required only after email verification
      },
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // OTP for login (separate from registration OTP)
    loginOtpCode: String,
    loginOtpExpires: Date,
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: function () {
        return this.emailVerified; // Required only after email verification
      },
    },
    phone: {
      type: String,
      required: function () {
        return this.emailVerified; // Required only after email verification
      },
      validate: {
        validator: function (value) {
          return !value || validator.isMobilePhone(value, "any");
        },
        message: "Please provide a valid phone number",
      },
    },
    country: {
      type: String,
      required: function () {
        return this.emailVerified; // Required only after email verification
      },
      trim: true,
    },
    // Persisted timezone (IANA) calculated from country when available
    timezone: {
      type: String,
      default: null,
      trim: true,
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Note: timezone is now stored persistently in the `timezone` field.

export default mongoose.model("User", userSchema);
