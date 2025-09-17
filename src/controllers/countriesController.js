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


export default {
  getAllCountries,
  getCountryTimezone,
};
