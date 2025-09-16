import httpStatusText from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import {
  COUNTRIES_TIMEZONES,
  getTimezoneForCountry,
} from "../utils/countryTimezone.js";

// @desc Get all supported countries with their timezones
// @route GET /api/v1/countries
// @access Public
export const getAllCountries = asyncWrapper(async (req, res, next) => {
  try {
    // Convert the COUNTRIES_TIMEZONES object to an array of countries
    const countries = Object.keys(COUNTRIES_TIMEZONES).map((country) => ({
      name: country,
      timezone: COUNTRIES_TIMEZONES[country],
      // Add a more readable timezone name if needed
      timezoneDisplay: COUNTRIES_TIMEZONES[country].replace("_", " "),
    }));

    // Sort countries alphabetically
    countries.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      results: countries.length,
      data: {
        countries,
        totalSupported: countries.length,
        supportedTimezones: [...new Set(countries.map((c) => c.timezone))]
          .length,
      },
    });
  } catch (error) {
    console.error("Error in getAllCountries:", error);
    return next(
      new AppError("Failed to fetch countries list", 500, httpStatusText.ERROR)
    );
  }
});

// @desc Get timezone for a specific country
// @route GET /api/v1/countries/:country/timezone
// @access Public
export const getCountryTimezone = asyncWrapper(async (req, res, next) => {
  try {
    const { country } = req.params;

    if (!country) {
      return next(
        new AppError("Country parameter is required", 400, httpStatusText.FAIL)
      );
    }

    const timezone = getTimezoneForCountry(country);

    if (!timezone) {
      return next(
        new AppError(
          `Timezone not found for country: ${country}`,
          404,
          httpStatusText.FAIL
        )
      );
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        country,
        timezone,
        isSupported: true,
      },
    });
  } catch (error) {
    console.error("Error in getCountryTimezone:", error);
    return next(
      new AppError("Failed to get country timezone", 500, httpStatusText.ERROR)
    );
  }
});

// @desc Check if a country is supported
// @route GET /api/v1/countries/:country/supported
// @access Public
export const checkCountrySupport = asyncWrapper(async (req, res, next) => {
  try {
    const { country } = req.params;

    if (!country) {
      return next(
        new AppError("Country parameter is required", 400, httpStatusText.FAIL)
      );
    }

    const isSupported = country in COUNTRIES_TIMEZONES;
    const timezone = isSupported ? COUNTRIES_TIMEZONES[country] : null;

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        country,
        isSupported,
        timezone,
        message: isSupported
          ? `Country ${country} is supported with timezone ${timezone}`
          : `Country ${country} is not supported. Please contact support.`,
      },
    });
  } catch (error) {
    console.error("Error in checkCountrySupport:", error);
    return next(
      new AppError("Failed to check country support", 500, httpStatusText.ERROR)
    );
  }
});

// @desc Get popular countries (commonly used ones)
// @route GET /api/v1/countries/popular
// @access Public
export const getPopularCountries = asyncWrapper(async (req, res, next) => {
  try {
    // Define a list of popular countries that are commonly used
    const popularCountryNames = [
      "United States",
      "United Kingdom",
      "Canada",
      "Australia",
      "Germany",
      "France",
      "Japan",
      "India",
      "Brazil",
      "Mexico",
      "Italy",
      "Spain",
      "Netherlands",
      "Sweden",
      "Norway",
      "Saudi Arabia",
      "UAE",
      "Egypt",
      "South Africa",
    ];

    const popularCountries = popularCountryNames
      .filter((country) => country in COUNTRIES_TIMEZONES)
      .map((country) => ({
        name: country,
        timezone: COUNTRIES_TIMEZONES[country],
        timezoneDisplay: COUNTRIES_TIMEZONES[country].replace("_", " "),
      }));

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      results: popularCountries.length,
      data: {
        popularCountries,
        message: "Most commonly used countries for booking",
      },
    });
  } catch (error) {
    console.error("Error in getPopularCountries:", error);
    return next(
      new AppError(
        "Failed to fetch popular countries",
        500,
        httpStatusText.ERROR
      )
    );
  }
});

export default {
  getAllCountries,
  getCountryTimezone,
  checkCountrySupport,
  getPopularCountries,
};
