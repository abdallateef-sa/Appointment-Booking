import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startsAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "missed"],
      default: "scheduled",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, startsAt: 1 }, { unique: true });
sessionSchema.index({ subscription: 1, startsAt: 1 });

const Session = mongoose.model("Session", sessionSchema);
export default Session;
