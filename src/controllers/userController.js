import httpStatusText from "../utils/httpStatusText.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";

// @desc Get user profile
// @route GET /api/v1/user/profile
// @access Private
export const getUserProfile = asyncWrapper(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        country: user.country,
        role: user.role,
        emailVerified: user.emailVerified,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});
