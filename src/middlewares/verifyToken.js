import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";

const verifyToken = (req, res, next) => {
  try {
    // Check for token in Authorization header first, then cookies
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        new AppError(
          "Not authenticated. Please provide a valid token.",
          401,
          httpStatusText.FAIL
        )
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return next(
      new AppError("Invalid or expired token", 401, httpStatusText.FAIL)
    );
  }
};

export default verifyToken;
