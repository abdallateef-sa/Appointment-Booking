import express from "express";
import { getBookedSessions } from "../controllers/sessionsController.js";

const router = express.Router();

// Get all booked sessions (public endpoint)
router.get("/booked", getBookedSessions);

export default router;
