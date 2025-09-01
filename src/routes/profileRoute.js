import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { getProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);

export default router;
