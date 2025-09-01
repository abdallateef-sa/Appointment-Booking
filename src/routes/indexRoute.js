import { Router } from "express";
import authRoute from "./authRoute.js";
import profileRoute from "./profileRoute.js";

const router = Router();

router.use("/auth", authRoute);
router.use("/profile", profileRoute);

export default router;
