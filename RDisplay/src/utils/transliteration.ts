/**
 * Transliteration utilities for converting Polish characters to ASCII
 * Based on RScraper's config_manager.py logic
 */

const polishChars: Record<string, string> = {
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
  'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
  'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
};

/**
 * Convert Polish characters to ASCII equivalents and replace spaces with underscores
 */
export const transliteratePolish = (text: string): string => {
  let result = text;

  // Replace Polish characters
  for (const [polish, ascii] of Object.entries(polishChars)) {
    result = result.replace(new RegExp(polish, 'g'), ascii);
  }

  // Replace spaces with underscores
  result = result.replace(/\s+/g, '_');

  return result;
};

/**
 * Generate CSV filename following RScraper convention
 * Format: {Country}__{Trip_Name}__{Departure_Airport}__{X}os.csv
 */
export const buildFileName = (
  country: string,
  tripName: string,
  departureAirport: string,
  persons: number
): string => {
  const countryClean = transliteratePolish(country);
  const tripNameClean = transliteratePolish(tripName);
  const airportClean = transliteratePolish(departureAirport);

  return `${countryClean}__${tripNameClean}__${airportClean}__${persons}os.csv`;
};