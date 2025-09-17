import express from "express";
import {
  getAllCountries,
  getCountryTimezone,
} from "../controllers/countriesController.js";

const router = express.Router();

// Public routes - no authentication required for countries information
router.route("/").get(getAllCountries);
router.route("/:country/timezone").get(getCountryTimezone);

export default router;
