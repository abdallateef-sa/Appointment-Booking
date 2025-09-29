import mongoose from "mongoose";

const sessionSlotSchema = new mongoose.Schema(
  {
    startsAtUTC: { type: Date, required: true }, // UTC time - main storage
    userLocalDate: { type: String, required: true }, // Original user date "2025-01-15"
    userLocalTime: { type: String, required: true }, // Original user time "14:30"
    userCountry: { type: String, required: true }, // User's country for timezone reference
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "missed"],
      default: "scheduled",
    },
    notes: { type: String, trim: true },
  },
  { _id: true }
);

const completeSubscriptionSchema = new mongoose.Schema(
  {
    // User Information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userCountry: {
      type: String,
      required: true,
    },

    // Subscription Plan Information
    subscriptionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    planPrice: {
      type: Number,
      required: true,
    },
    planCurrency: {
      type: String,
      default: "EGP",
    },

    // Subscription Dates
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Session Information
    totalSessions: {
      type: Number,
      required: true,
      min: 1,
    },
    sessionsPerWeek: {
      type: Number,
      required: true,
      min: 1,
    },

    // All Scheduled Sessions
    sessions: [sessionSlotSchema],

    // Status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "expired",
      ],
      default: "confirmed", // Since all sessions are booked at once
    },

    // Payment Status (optional for future)
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Payment confirmation details
    paymentConfirmedAt: {
      type: Date,
      default: null,
    },
    paymentReference: {
      type: String,
      default: null,
    },

    // Additional Notes
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for sessions completed
completeSubscriptionSchema.virtual("sessionsCompleted").get(function () {
  return this.sessions.filter(
    (session) => session.status === "completed"
  ).length;
});

// Virtual for sessions remaining
completeSubscriptionSchema.virtual("sessionsRemaining").get(function () {
  return this.sessions.filter(
    (session) => session.status === "scheduled" || session.status === "missed"
  ).length;
});

// Virtual for next session
completeSubscriptionSchema.virtual("nextSession").get(function () {
  const now = new Date();
  const upcomingSessions = this.sessions
    .filter(
      (session) => session.status === "scheduled" && session.startsAtUTC > now
    )
    .sort((a, b) => a.startsAtUTC - b.startsAtUTC);

  return upcomingSessions.length > 0 ? upcomingSessions[0] : null;
});

// Indexes
completeSubscriptionSchema.index({ user: 1, status: 1 });
completeSubscriptionSchema.index({ userEmail: 1 });
completeSubscriptionSchema.index({ "sessions.startsAtUTC": 1 });
completeSubscriptionSchema.index({ startDate: 1, endDate: 1 });

// Remove pre-save middleware - UTC times are calculated in controllers

const CompleteSubscription = mongoose.model(
  "CompleteSubscription",
  completeSubscriptionSchema
);
export default CompleteSubscription;
