import CompleteSubscription from "../models/subscriptionModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";

// @desc Get all complete subscriptions (Admin only)
// @route GET /api/v1/admin/complete-subscriptions
// @access Private/Admin
export const getAllCompleteSubscriptions = asyncWrapper(
  async (req, res, next) => {
    const {
      page = 1,
      limit = 10,
      status,
      userEmail,
      planName,
      sort = "-createdAt",
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (userEmail) filter.userEmail = { $regex: userEmail, $options: "i" };
    if (planName) filter.planName = { $regex: planName, $options: "i" };

    // Calculate pagination
    const skip = (page - 1) * limit;

    const subscriptions = await CompleteSubscription.find(filter)
      .populate("user", "name email phone")
      .populate("subscriptionPlan", "name description")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const total = await CompleteSubscription.countDocuments(filter);

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      results: subscriptions.length,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSubscriptions: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: {
        subscriptions: subscriptions.map((sub) => ({
          id: sub._id,
          user: sub.user,
          userEmail: sub.userEmail,
          planName: sub.planName,
          planPrice: sub.planPrice,
          planCurrency: sub.planCurrency,
          startDate: sub.startDate,
          endDate: sub.endDate,
          totalSessions: sub.totalSessions,
          sessionsCompleted: sub.sessionsCompleted,
          sessionsRemaining: sub.sessionsRemaining,
          status: sub.status,
          paymentStatus: sub.paymentStatus,
          nextSession: sub.nextSession,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        })),
      },
    });
  }
);

// @desc Get single complete subscription (Admin only)
// @route GET /api/v1/admin/complete-subscriptions/:id
// @access Private/Admin
export const getCompleteSubscriptionById = asyncWrapper(
  async (req, res, next) => {
    const { id } = req.params;

    const subscription = await CompleteSubscription.findById(id)
      .populate("user", "name email phone createdAt")
      .populate("subscriptionPlan")
      .select("-__v");

    if (!subscription) {
      return next(
        new AppError(
          "Complete subscription not found",
          404,
          httpStatusText.FAIL
        )
      );
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        subscription: {
          id: subscription._id,
          user: subscription.user,
          userEmail: subscription.userEmail,
          subscriptionPlan: subscription.subscriptionPlan,
          planName: subscription.planName,
          planPrice: subscription.planPrice,
          planCurrency: subscription.planCurrency,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          totalSessions: subscription.totalSessions,
          sessionsPerWeek: subscription.sessionsPerWeek,
          sessionsCompleted: subscription.sessionsCompleted,
          sessionsRemaining: subscription.sessionsRemaining,
          status: subscription.status,
          paymentStatus: subscription.paymentStatus,
          notes: subscription.notes,
          nextSession: subscription.nextSession,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
          sessions: subscription.sessions.map((session) => ({
            id: session._id,
            date: session.date,
            time: session.time,
            startsAt: session.startsAt,
            status: session.status,
            notes: session.notes,
          })),
        },
      },
    });
  }
);

// @desc Update complete subscription status (Admin only)
// @route PATCH /api/v1/admin/complete-subscriptions/:id/status
// @access Private/Admin
export const updateCompleteSubscriptionStatus = asyncWrapper(
  async (req, res, next) => {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const subscription = await CompleteSubscription.findById(id);
    if (!subscription) {
      return next(
        new AppError(
          "Complete subscription not found",
          404,
          httpStatusText.FAIL
        )
      );
    }

    // Update fields
    if (status) subscription.status = status;
    if (paymentStatus) subscription.paymentStatus = paymentStatus;
    if (notes !== undefined) subscription.notes = notes;

    await subscription.save();

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Complete subscription updated successfully",
      data: {
        subscription: {
          id: subscription._id,
          status: subscription.status,
          paymentStatus: subscription.paymentStatus,
          notes: subscription.notes,
        },
      },
    });
  }
);

// @desc Update session status in complete subscription (Admin only)
// @route PATCH /api/v1/admin/complete-subscriptions/:id/sessions/:sessionId
// @access Private/Admin
export const updateSessionStatusAdmin = asyncWrapper(async (req, res, next) => {
  const { id, sessionId } = req.params;
  const { status, notes } = req.body;

  const subscription = await CompleteSubscription.findById(id);
  if (!subscription) {
    return next(
      new AppError("Complete subscription not found", 404, httpStatusText.FAIL)
    );
  }

  const session = subscription.sessions.id(sessionId);
  if (!session) {
    return next(new AppError("Session not found", 404, httpStatusText.FAIL));
  }

  // Update session
  if (status) session.status = status;
  if (notes !== undefined) session.notes = notes;

  await subscription.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Session updated successfully",
    data: {
      session: {
        id: session._id,
        date: session.date,
        time: session.time,
        startsAt: session.startsAt,
        status: session.status,
        notes: session.notes,
      },
    },
  });
});

// @desc Delete complete subscription (Admin only)
// @route DELETE /api/v1/admin/complete-subscriptions/:id
// @access Private/Admin
export const deleteCompleteSubscription = asyncWrapper(
  async (req, res, next) => {
    const { id } = req.params;

    const subscription = await CompleteSubscription.findById(id);
    if (!subscription) {
      return next(
        new AppError(
          "Complete subscription not found",
          404,
          httpStatusText.FAIL
        )
      );
    }

    await CompleteSubscription.findByIdAndDelete(id);

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Complete subscription deleted successfully",
      data: null,
    });
  }
);

// @desc Get complete subscription statistics (Admin only)
// @route GET /api/v1/admin/complete-subscriptions/stats
// @access Private/Admin
export const getCompleteSubscriptionStats = asyncWrapper(
  async (req, res, next) => {
    const totalSubscriptions = await CompleteSubscription.countDocuments();

    const statusStats = await CompleteSubscription.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const paymentStats = await CompleteSubscription.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$planPrice" },
        },
      },
    ]);

    const planStats = await CompleteSubscription.aggregate([
      {
        $group: {
          _id: "$planName",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$planPrice" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const monthlyStats = await CompleteSubscription.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$planPrice" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        totalSubscriptions,
        statusBreakdown: statusStats,
        paymentBreakdown: paymentStats,
        popularPlans: planStats,
        monthlyTrends: monthlyStats,
      },
    });
  }
);
