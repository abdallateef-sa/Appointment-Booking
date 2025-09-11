import { Router } from "express";
import authRoute from "./authRoute.js";
import adminRoute from "./adminRoute.js";
import userRoute from "./userRoute.js";
import { listActivePlans } from "../controllers/publicController.js";

const router = Router();

router.use("/auth", authRoute);
router.use("/admin", adminRoute);
router.use("/user", userRoute);

// Public plans list (no auth) to pick a plan before subscribe
router.get("/plans", listActivePlans);

export default router;
