import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { subscribeToPlan } from "../controllers/subscriptionController.js";
import { handleValidationErrors } from "../utils/validators/authValidators.js";
import {
  validateSubscribeToPlan,
  validateCreateSession,
} from "../utils/validators/subscriptionValidators.js";
import { createSession } from "../controllers/sessionController.js";
import {
  mySubscriptions,
  mySessions,
} from "../controllers/userViewController.js";

const router = Router();

router.post(
  "/subscriptions",
  verifyToken,
  validateSubscribeToPlan,
  handleValidationErrors,
  subscribeToPlan
);

router.post(
  "/sessions",
  verifyToken,
  validateCreateSession,
  handleValidationErrors,
  createSession
);

// User views: my subscriptions and my sessions
router.get("/subscriptions", verifyToken, mySubscriptions);
router.get("/sessions", verifyToken, mySessions);

export default router;
