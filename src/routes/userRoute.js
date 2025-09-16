import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createCompleteSubscription,
  getMyCompleteSubscriptions,
} from "../controllers/subscriptionController.js";
import { getUserProfile } from "../controllers/userController.js";
import {
  validateCreateCompleteSubscription,
  handleCompleteSubscriptionValidation,
} from "../utils/validators/subscriptionValidators.js";

const router = Router();

// User Profile
router.get("/profile", verifyToken, getUserProfile);

// Complete Subscription (New Simple Flow)
router.post(
  "/complete-subscription",
  verifyToken,
  validateCreateCompleteSubscription,
  handleCompleteSubscriptionValidation,
  createCompleteSubscription
);

router.get("/complete-subscriptions", verifyToken, getMyCompleteSubscriptions);

export default router;
