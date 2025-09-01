import user from "../models/userModel.js";

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch only existing/needed fields
    const foundUser = await user
      .findById(userId)
      .select("firstName lastName email phone gender country role")
      .lean();

    if (!foundUser) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        id: userId,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        phone: foundUser.phone,
        gender: foundUser.gender,
        country: foundUser.country,
        role: foundUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
