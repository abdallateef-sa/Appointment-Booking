import SubscriptionPlan from "../models/planModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";

// @desc Create new subscription plan (Admin only)
// @route POST /api/v1/admin/subscription-plans
// @access Private/Admin
export const createSubscriptionPlan = asyncWrapper(async (req, res, next) => {
  const {
    name,
    description,
    sessionsPerMonth,
    sessionsPerWeek,
    price,
    currency,
    features,
    duration,
  } = req.body;

  // Validate that user is authenticated and is admin
  if (!req.user || !req.user.id) {
    return next(
      new AppError("User not authenticated", 401, httpStatusText.FAIL)
    );
  }

  if (req.user.role !== "Admin") {
    return next(new AppError("Admin access only", 403, httpStatusText.FAIL));
  }

  // Check if plan with same name already exists
  const existingPlan = await SubscriptionPlan.findOne({ name: name.trim() });
  if (existingPlan) {
    return next(
      new AppError(
        "Subscription plan with this name already exists",
        409,
        httpStatusText.FAIL
      )
    );
  }

  const planData = {
    name: name.trim(),
    description: description?.trim(),
    sessionsPerMonth,
    sessionsPerWeek,
    price,
    currency: currency || "EGP",
    features: features || [],
    duration: duration || 30,
    createdBy: req.user.id,
  };

  const subscriptionPlan = await SubscriptionPlan.create(planData);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Subscription plan created successfully",
    data: {
      subscriptionPlan: {
        id: subscriptionPlan._id,
        name: subscriptionPlan.name,
        description: subscriptionPlan.description,
        sessionsPerMonth: subscriptionPlan.sessionsPerMonth,
        sessionsPerWeek: subscriptionPlan.sessionsPerWeek,
        price: subscriptionPlan.price,
        currency: subscriptionPlan.currency,
        features: subscriptionPlan.features,
        duration: subscriptionPlan.duration,
        isActive: subscriptionPlan.isActive,
        createdAt: subscriptionPlan.createdAt,
        createdBy: {
          id: req.user.id,
          email: req.user.email,
        },
      },
    },
  });
});

// @desc Get all subscription plans (Admin only)
// @route GET /api/v1/admin/subscription-plans
// @access Private/Admin
export const getAllSubscriptionPlans = asyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10, isActive, sort = "-createdAt" } = req.query;

  // Build filter
  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  const subscriptionPlans = await SubscriptionPlan.find(filter)
    .populate("createdBy", "name email")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select("-__v");

  const total = await SubscriptionPlan.countDocuments(filter);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: subscriptionPlans.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalPlans: total,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    data: {
      subscriptionPlans,
    },
  });
});

// @desc Get single subscription plan (Admin only)
// @route GET /api/v1/admin/subscription-plans/:id
// @access Private/Admin
export const getSubscriptionPlan = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const subscriptionPlan = await SubscriptionPlan.findById(id)
    .populate("createdBy", "name email")
    .select("-__v");

  if (!subscriptionPlan) {
    return next(
      new AppError("Subscription plan not found", 404, httpStatusText.FAIL)
    );
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      subscriptionPlan,
    },
  });
});

// @desc Update subscription plan (Admin only)
// @route PUT /api/v1/admin/subscription-plans/:id
// @access Private/Admin
export const updateSubscriptionPlan = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    description,
    sessionsPerMonth,
    sessionsPerWeek,
    price,
    currency,
    features,
    duration,
    isActive,
  } = req.body;

  // Check if plan exists
  const existingPlan = await SubscriptionPlan.findById(id);
  if (!existingPlan) {
    return next(
      new AppError("Subscription plan not found", 404, httpStatusText.FAIL)
    );
  }

  // Check if new name conflicts with another plan
  if (name && name.trim() !== existingPlan.name) {
    const nameConflict = await SubscriptionPlan.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });
    if (nameConflict) {
      return next(
        new AppError(
          "Another subscription plan with this name already exists",
          409,
          httpStatusText.FAIL
        )
      );
    }
  }

  const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
    id,
    {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() }),
      ...(sessionsPerMonth && { sessionsPerMonth }),
      ...(sessionsPerWeek && { sessionsPerWeek }),
      ...(price !== undefined && { price }),
      ...(currency && { currency }),
      ...(features && { features }),
      ...(duration && { duration }),
      ...(isActive !== undefined && { isActive }),
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("createdBy", "name email");

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Subscription plan updated successfully",
    data: {
      subscriptionPlan: updatedPlan,
    },
  });
});

// @desc Delete subscription plan (Admin only)
// @route DELETE /api/v1/admin/subscription-plans/:id
// @access Private/Admin
export const deleteSubscriptionPlan = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const subscriptionPlan = await SubscriptionPlan.findById(id);

  if (!subscriptionPlan) {
    return next(
      new AppError("Subscription plan not found", 404, httpStatusText.FAIL)
    );
  }

  await SubscriptionPlan.findByIdAndDelete(id);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Subscription plan deleted successfully",
    data: null,
  });
});

// @desc Toggle subscription plan active status (Admin only)
// @route PATCH /api/v1/admin/subscription-plans/:id/toggle
// @access Private/Admin
export const toggleSubscriptionPlanStatus = asyncWrapper(
  async (req, res, next) => {
    const { id } = req.params;

    const subscriptionPlan = await SubscriptionPlan.findById(id);

    if (!subscriptionPlan) {
      return next(
        new AppError("Subscription plan not found", 404, httpStatusText.FAIL)
      );
    }

    subscriptionPlan.isActive = !subscriptionPlan.isActive;
    await subscriptionPlan.save();

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: `Subscription plan ${
        subscriptionPlan.isActive ? "activated" : "deactivated"
      } successfully`,
      data: {
        subscriptionPlan: {
          id: subscriptionPlan._id,
          name: subscriptionPlan.name,
          isActive: subscriptionPlan.isActive,
        },
      },
    });
  }
);
