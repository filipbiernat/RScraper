/**
 * CSV file discovery - derives available departure airports and person counts
 * from actual CSV files in the GitHub data/ folder
 */

import { transliteratePolish } from './transliteration';

export interface CsvFileEntry {
    country: string;        // transliterated (from filename)
    tripName: string;       // transliterated (from filename)
    airport: string;        // transliterated with underscores (from filename)
    airportDisplay: string; // display name with spaces
    persons: number;
    fileName: string;
}

/**
 * Parse a single CSV filename into components
 * Format: {Country}__{Trip_Name}__{Departure_Airport}__{X}os.csv
 */
const parseCsvFileName = (fileName: string): CsvFileEntry | null => {
    const baseName = fileName.replace('.csv', '');
    const parts = baseName.split('__');

    if (parts.length !== 4) return null;

    const [country, tripName, airport, personsStr] = parts;
    const personsMatch = personsStr.match(/^(\d+)os$/);
    if (!personsMatch) return null;

    return {
        country,
        tripName,
        airport,
        airportDisplay: airport.replace(/_/g, ' '),
        persons: parseInt(personsMatch[1], 10),
        fileName
    };
};

/**
 * Fetch the list of CSV files from GitHub and parse their names
 */
export const fetchCsvFileEntries = async (): Promise<CsvFileEntry[]> => {
    const response = await fetch(
        'https://api.github.com/repos/filipbiernat/RScraper/contents/data'
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch file list: ${response.status}`);
    }

    const files: { name: string; type: string }[] = await response.json();

    return files
        .filter(f => f.type === 'file' && f.name.endsWith('.csv'))
        .map(f => parseCsvFileName(f.name))
        .filter((entry): entry is CsvFileEntry => entry !== null);
};

/**
 * Get available departure airports for a given country + trip
 * (country and tripName are original Polish names from sources.json)
 */
export const getAvailableAirports = (
    entries: CsvFileEntry[],
    country: string,
    tripName: string
): string[] => {
    const tc = transliteratePolish(country);
    const tt = transliteratePolish(tripName);

    const airports = new Set<string>();
    for (const entry of entries) {
        if (entry.country === tc && entry.tripName === tt) {
            airports.add(entry.airportDisplay);
        }
    }
    return Array.from(airports);
};

/**
 * Get available person counts for a given country + trip + airport
 */
export const getAvailablePersonCounts = (
    entries: CsvFileEntry[],
    country: string,
    tripName: string,
    airport: string
): number[] => {
    const tc = transliteratePolish(country);
    const tt = transliteratePolish(tripName);
    const ta = transliteratePolish(airport);

    const persons = new Set<number>();
    for (const entry of entries) {
        if (entry.country === tc && entry.tripName === tt && entry.airport === ta) {
            persons.add(entry.persons);
        }
    }
    return Array.from(persons);
};
