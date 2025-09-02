import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  logout,
  resetPassword,
} from "../controllers/adminController.js";
import {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  toggleSubscriptionPlanStatus,
} from "../controllers/subscriptionPlanController.js";
import verifyToken from "../middlewares/verifyToken.js";
import requireAdmin from "../middlewares/requireAdmin.js";
import {
  validateAdminRegister,
  validateAdminLogin,
  validateAdminForgotPassword,
  validateAdminResetPassword,
  handleAdminValidation,
} from "../utils/validators/adminValidators.js";
import {
  validateCreateSubscriptionPlan,
  validateUpdateSubscriptionPlan,
  validateSubscriptionPlanId,
} from "../utils/validators/subscriptionPlanValidators.js";
import {
  adminListSubscriptions,
  adminListSessions,
} from "../controllers/adminViewController.js";

const router = Router();

router.post(
  "/register",
  validateAdminRegister,
  handleAdminValidation,
  register
);
router.post("/login", validateAdminLogin, handleAdminValidation, login);
router.post("/logout", verifyToken, requireAdmin, logout);
router.post(
  "/forgot-password",
  validateAdminForgotPassword,
  handleAdminValidation,
  forgotPassword
);
router.post(
  "/reset-password",
  validateAdminResetPassword,
  handleAdminValidation,
  resetPassword
);

// Subscription Plans Routes
router.post(
  "/subscription-plans",
  verifyToken,
  requireAdmin,
  validateCreateSubscriptionPlan,
  handleAdminValidation,
  createSubscriptionPlan
);

router.get(
  "/subscription-plans",
  verifyToken,
  requireAdmin,
  getAllSubscriptionPlans
);

router.get(
  "/subscription-plans/:id",
  verifyToken,
  requireAdmin,
  validateSubscriptionPlanId,
  handleAdminValidation,
  getSubscriptionPlan
);

router.put(
  "/subscription-plans/:id",
  verifyToken,
  requireAdmin,
  validateUpdateSubscriptionPlan,
  handleAdminValidation,
  updateSubscriptionPlan
);

router.delete(
  "/subscription-plans/:id",
  verifyToken,
  requireAdmin,
  validateSubscriptionPlanId,
  handleAdminValidation,
  deleteSubscriptionPlan
);

router.patch(
  "/subscription-plans/:id/toggle",
  verifyToken,
  requireAdmin,
  validateSubscriptionPlanId,
  handleAdminValidation,
  toggleSubscriptionPlanStatus
);

// Admin views: list all subscriptions and sessions
router.get("/subscriptions", verifyToken, requireAdmin, adminListSubscriptions);
router.get("/sessions", verifyToken, requireAdmin, adminListSessions);

export default router;
