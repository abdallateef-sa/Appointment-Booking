import express from "express";
import {
  getAllCountries,
  getCountryTimezone,
  checkCountrySupport,
  getPopularCountries,
} from "../controllers/countriesController.js";

const router = express.Router();

// Public routes - no authentication required for countries information
router.route("/").get(getAllCountries);
router.route("/popular").get(getPopularCountries);
router.route("/:country/timezone").get(getCountryTimezone);
router.route("/:country/supported").get(checkCountrySupport);

export default router;
