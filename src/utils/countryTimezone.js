/**
 * Countries and their corresponding timezones
 * Used to automatically determine timezone from user's country
 */

export const COUNTRIES_TIMEZONES = {
  // Middle East & Gulf
  "Saudi Arabia": "Asia/Riyadh",
  UAE: "Asia/Dubai",
  "United Arab Emirates": "Asia/Dubai",
  Kuwait: "Asia/Kuwait",
  Qatar: "Asia/Qatar",
  Bahrain: "Asia/Bahrain",
  Oman: "Asia/Muscat",
  Jordan: "Asia/Amman",
  Lebanon: "Asia/Beirut",
  Syria: "Asia/Damascus",
  Iraq: "Asia/Baghdad",
  Iran: "Asia/Tehran",
  Turkey: "Europe/Istanbul",
  Yemen: "Asia/Aden",
  Palestine: "Asia/Gaza",

  // Egypt & North Africa
  Egypt: "Africa/Cairo",
  Libya: "Africa/Tripoli",
  Tunisia: "Africa/Tunis",
  Algeria: "Africa/Algiers",
  Morocco: "Africa/Casablanca",
  Sudan: "Africa/Khartoum",

  // Europe
  "United Kingdom": "Europe/London",
  UK: "Europe/London",
  France: "Europe/Paris",
  Germany: "Europe/Berlin",
  Italy: "Europe/Rome",
  Spain: "Europe/Madrid",
  Netherlands: "Europe/Amsterdam",
  Belgium: "Europe/Brussels",
  Switzerland: "Europe/Zurich",
  Austria: "Europe/Vienna",
  Sweden: "Europe/Stockholm",
  Norway: "Europe/Oslo",
  Denmark: "Europe/Copenhagen",
  Finland: "Europe/Helsinki",
  Poland: "Europe/Warsaw",
  "Czech Republic": "Europe/Prague",
  Hungary: "Europe/Budapest",
  Romania: "Europe/Bucharest",
  Bulgaria: "Europe/Sofia",
  Greece: "Europe/Athens",
  Portugal: "Europe/Lisbon",
  Ireland: "Europe/Dublin",
  Croatia: "Europe/Zagreb",
  Serbia: "Europe/Belgrade",
  Slovenia: "Europe/Ljubljana",
  Slovakia: "Europe/Bratislava",
  Estonia: "Europe/Tallinn",
  Latvia: "Europe/Riga",
  Lithuania: "Europe/Vilnius",
  Ukraine: "Europe/Kiev",
  Belarus: "Europe/Minsk",
  Moldova: "Europe/Chisinau",
  Russia: "Europe/Moscow",

  // North America
  "United States": "America/New_York",
  USA: "America/New_York",
  US: "America/New_York",
  Canada: "America/Toronto",
  Mexico: "America/Mexico_City",

  // South America
  Brazil: "America/Sao_Paulo",
  Argentina: "America/Buenos_Aires",
  Chile: "America/Santiago",
  Colombia: "America/Bogota",
  Peru: "America/Lima",
  Venezuela: "America/Caracas",
  Ecuador: "America/Guayaquil",
  Bolivia: "America/La_Paz",
  Paraguay: "America/Asuncion",
  Uruguay: "America/Montevideo",

  // Asia Pacific
  China: "Asia/Shanghai",
  Japan: "Asia/Tokyo",
  "South Korea": "Asia/Seoul",
  India: "Asia/Kolkata",
  Pakistan: "Asia/Karachi",
  Bangladesh: "Asia/Dhaka",
  "Sri Lanka": "Asia/Colombo",
  Nepal: "Asia/Kathmandu",
  Thailand: "Asia/Bangkok",
  Vietnam: "Asia/Ho_Chi_Minh",
  Malaysia: "Asia/Kuala_Lumpur",
  Singapore: "Asia/Singapore",
  Indonesia: "Asia/Jakarta",
  Philippines: "Asia/Manila",
  Myanmar: "Asia/Yangon",
  Cambodia: "Asia/Phnom_Penh",
  Laos: "Asia/Vientiane",
  Mongolia: "Asia/Ulaanbaatar",
  Kazakhstan: "Asia/Almaty",
  Uzbekistan: "Asia/Tashkent",
  Turkmenistan: "Asia/Ashgabat",
  Kyrgyzstan: "Asia/Bishkek",
  Tajikistan: "Asia/Dushanbe",
  Afghanistan: "Asia/Kabul",

  // Oceania
  Australia: "Australia/Sydney",
  "New Zealand": "Pacific/Auckland",
  Fiji: "Pacific/Fiji",

  // Africa
  "South Africa": "Africa/Johannesburg",
  Nigeria: "Africa/Lagos",
  Kenya: "Africa/Nairobi",
  Ethiopia: "Africa/Addis_Ababa",
  Ghana: "Africa/Accra",
  Tanzania: "Africa/Dar_es_Salaam",
  Uganda: "Africa/Kampala",
  Rwanda: "Africa/Kigali",
  Zambia: "Africa/Lusaka",
  Zimbabwe: "Africa/Harare",
  Botswana: "Africa/Gaborone",
  Namibia: "Africa/Windhoek",
  Madagascar: "Indian/Antananarivo",
  Mauritius: "Indian/Mauritius",
  Seychelles: "Indian/Mahe",
};

/**
 * Get timezone for a country
 * @param {string} country - Country name
 * @returns {string} - IANA timezone string
 */
export function getTimezoneForCountry(country) {
  if (!country) return "UTC";

  // Direct lookup
  if (COUNTRIES_TIMEZONES[country]) {
    return COUNTRIES_TIMEZONES[country];
  }

  // Case-insensitive lookup
  const normalizedCountry = country.trim();
  const foundKey = Object.keys(COUNTRIES_TIMEZONES).find(
    (key) => key.toLowerCase() === normalizedCountry.toLowerCase()
  );

  return foundKey ? COUNTRIES_TIMEZONES[foundKey] : "UTC";
}

/**
 * Get all supported countries
 * @returns {Array} - Array of objects with country and timezone
 */
export function getAllCountries() {
  return Object.entries(COUNTRIES_TIMEZONES).map(([country, timezone]) => ({
    country,
    timezone,
  }));
}

/**
 * Validate if timezone is supported
 * @param {string} timezone - IANA timezone string
 * @returns {boolean}
 */
export function isValidTimezone(timezone) {
  try {
    return Object.values(COUNTRIES_TIMEZONES).includes(timezone);
  } catch (error) {
    return false;
  }
}

/**
 * Search countries by name
 * @param {string} searchTerm - Search term
 * @returns {Array} - Matching countries
 */
export function searchCountries(searchTerm) {
  if (!searchTerm) return getAllCountries();

  const term = searchTerm.toLowerCase();
  return Object.entries(COUNTRIES_TIMEZONES)
    .filter(([country]) => country.toLowerCase().includes(term))
    .map(([country, timezone]) => ({ country, timezone }));
}

export default {
  COUNTRIES_TIMEZONES,
  getTimezoneForCountry,
  getAllCountries,
  isValidTimezone,
  searchCountries,
};
