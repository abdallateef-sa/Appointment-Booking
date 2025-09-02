import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      minlength: [2, "Plan name must be at least 2 characters"],
      maxlength: [100, "Plan name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    sessionsPerMonth: {
      type: Number,
      required: [true, "Number of sessions per month is required"],
      min: [1, "Sessions per month must be at least 1"],
      max: [100, "Sessions per month cannot exceed 100"],
    },
    sessionsPerWeek: {
      type: Number,
      required: [true, "Number of sessions per week is required"],
      min: [1, "Sessions per week must be at least 1"],
      max: [7, "Sessions per week cannot exceed 7"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [100000, "Price cannot exceed 100,000"],
    },
    currency: {
      type: String,
      default: "EGP",
      enum: ["EGP", "USD", "EUR"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    duration: {
      type: Number,
      default: 30, // days
      min: [1, "Duration must be at least 1 day"],
      max: [365, "Duration cannot exceed 365 days"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for price per session
subscriptionPlanSchema.virtual("pricePerSession").get(function () {
  return this.price / this.sessionsPerMonth;
});

// Index for better query performance
subscriptionPlanSchema.index({ isActive: 1, createdAt: -1 });
subscriptionPlanSchema.index({ price: 1 });
subscriptionPlanSchema.index({ sessionsPerMonth: 1 });

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
