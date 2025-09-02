import AppError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return next(new AppError("Admin access only", 403, httpStatusText.FAIL));
  }
  next();
};

export default requireAdmin;
