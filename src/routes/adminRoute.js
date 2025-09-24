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
} from "../controllers/planController.js";
import verifyToken from "../middlewares/verifyToken.js";
import optionalVerifyToken from "../middlewares/optionalVerifyToken.js";
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
} from "../utils/validators/planValidators.js";
import {
  getAllCompleteSubscriptions,
  getCompleteSubscriptionById,
  updateCompleteSubscriptionStatus,
  updateSessionStatusAdmin,
  deleteCompleteSubscription,
  getCompleteSubscriptionStats,
} from "../controllers/adminSubscriptionController.js";
import {
  validateCompleteSubscriptionId,
  validateSessionId,
  validateUpdateSessionStatus,
  handleCompleteSubscriptionValidation,
} from "../utils/validators/subscriptionValidators.js";

const router = Router();

router.post(
  "/register",
  optionalVerifyToken,
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

// Complete Subscriptions Management Routes
router.get(
  "/complete-subscriptions/stats",
  verifyToken,
  requireAdmin,
  getCompleteSubscriptionStats
);

router.get(
  "/complete-subscriptions",
  verifyToken,
  requireAdmin,
  getAllCompleteSubscriptions
);

router.get(
  "/complete-subscriptions/:id",
  verifyToken,
  requireAdmin,
  validateCompleteSubscriptionId,
  handleCompleteSubscriptionValidation,
  getCompleteSubscriptionById
);

router.patch(
  "/complete-subscriptions/:id/status",
  verifyToken,
  requireAdmin,
  validateCompleteSubscriptionId,
  handleCompleteSubscriptionValidation,
  updateCompleteSubscriptionStatus
);

router.patch(
  "/complete-subscriptions/:id/sessions/:sessionId",
  verifyToken,
  requireAdmin,
  validateCompleteSubscriptionId,
  validateSessionId,
  validateUpdateSessionStatus,
  handleCompleteSubscriptionValidation,
  updateSessionStatusAdmin
);

router.delete(
  "/complete-subscriptions/:id",
  verifyToken,
  requireAdmin,
  validateCompleteSubscriptionId,
  handleCompleteSubscriptionValidation,
  deleteCompleteSubscription
);

export default router;
