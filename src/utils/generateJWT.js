import jwt from "jsonwebtoken";

const generateToken = async (payload) => {
  const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION || "1h",
  });

  return token;
};

export default generateToken;
