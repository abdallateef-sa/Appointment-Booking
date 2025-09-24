import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";

const optionalVerifyToken = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      // No token provided — this middleware is optional, so continue without error
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded.temporary) {
      req.user = decoded;
      return next();
    }

    let found;
    if (decoded.role === "Admin") {
      found = await adminModel.findById(decoded.id);
      if (!found) {
        return next(new AppError("Admin not found", 404, httpStatusText.FAIL));
      }
    } else {
      found = await userModel.findById(decoded.id);
      if (!found) {
        return next(new AppError("User not found", 404, httpStatusText.FAIL));
      }
    }
    req.user = found;
    next();
  } catch (error) {
    // If token invalid/expired, treat as authentication error
    return next(
      new AppError("Invalid or expired token", 401, httpStatusText.FAIL)
    );
  }
};

export default optionalVerifyToken;
