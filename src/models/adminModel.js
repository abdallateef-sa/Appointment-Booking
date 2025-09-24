import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

// Protect the configured super-admin email
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: (value) => validator.isMobilePhone(value, "any"),
        message: "Please provide a valid phone number",
      },
    },
    role: {
      type: String,
      enum: ["Admin"],
      default: "Admin",
      immutable: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    otp: String,
    otpExpires: Date,
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// Prevent deleting the super-admin by query (findOneAndDelete / findByIdAndDelete)
adminSchema.pre("findOneAndDelete", async function (next) {
  if (!SUPER_ADMIN_EMAIL) return next();
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc && doc.email === SUPER_ADMIN_EMAIL) {
      throw new Error("Cannot delete the configured super-admin account");
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Prevent deleting the super-admin via document.remove()
adminSchema.pre("remove", function (next) {
  if (!SUPER_ADMIN_EMAIL) return next();
  if (this.email === SUPER_ADMIN_EMAIL) {
    return next(new Error("Cannot delete the configured super-admin account"));
  }
  next();
});

// Prevent changing the super-admin's email
adminSchema.pre("findOneAndUpdate", async function (next) {
  if (!SUPER_ADMIN_EMAIL) return next();
  try {
    const update = this.getUpdate();
    if (!update) return next();
    const newEmail = update.email || (update.$set && update.$set.email);
    const doc = await this.model.findOne(this.getQuery());
    if (
      doc &&
      doc.email === SUPER_ADMIN_EMAIL &&
      newEmail &&
      newEmail !== SUPER_ADMIN_EMAIL
    ) {
      throw new Error("Cannot change the super-admin email");
    }
    next();
  } catch (err) {
    next(err);
  }
});

adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

adminSchema.methods.verifyOTP = function (candidateOTP) {
  return this.otp === candidateOTP && this.otpExpires > Date.now();
};

export default mongoose.model("Admin", adminSchema);
