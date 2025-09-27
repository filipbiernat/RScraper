/**
 * CSV parsing utilities for loading and processing travel data
 */

import type { CsvData, TripTerm, PriceEntry, ParsedCsvRow } from '../types/csvData';
import { parseDateFromTerm, parseEndDateFromTerm, isTripPast } from './dateUtils';

/**
 * Parse CSV text content into structured data
 */
export const parseCsvContent = (csvContent: string, fileName: string): CsvData => {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('Invalid CSV format: insufficient data');
  }

  // Parse header row (timestamps)
  const headerRow = lines[0].split(',');
  const timestamps = headerRow.slice(1); // Skip first empty column

  // Parse data rows and extract special rows
  const parsedRows: ParsedCsvRow[] = [];
  let offerUrl: string | undefined = undefined;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    const dateRange = row[0];

    // Skip special rows like OFFER_LINK but extract the URL
    if (dateRange === 'OFFER_LINK') {
      offerUrl = row[1] || undefined;
      continue;
    }

    const prices = row.slice(1).map(priceStr => {
      const price = parseInt(priceStr, 10);
      return isNaN(price) ? null : price;
    });

    parsedRows.push({ dateRange, prices });
  }

  // Filter out past trips
  const futureRows = parsedRows.filter(row => !isTripPast(row.dateRange));

  // Convert to TripTerm objects
  const terms: TripTerm[] = futureRows.map(row => {
    const priceHistory: PriceEntry[] = timestamps
      .map((timestamp, index) => ({
        timestamp,
        price: row.prices[index] || 0
      }))
      .filter(entry => entry.price > 0); // Only valid prices

    const currentPrice = priceHistory.length > 0
      ? priceHistory[priceHistory.length - 1].price
      : 0;

    return {
      dateRange: row.dateRange,
      startDate: parseDateFromTerm(row.dateRange),
      endDate: parseEndDateFromTerm(row.dateRange),
      priceHistory,
      currentPrice
    };
  });

  // Filter timestamps that have at least one valid price entry
  const activeTimestamps = timestamps.filter((_, index) =>
    futureRows.some(row => row.prices[index] !== null && row.prices[index] !== undefined)
  );

  // Determine last updated timestamp
  const lastUpdated = activeTimestamps.length > 0
    ? activeTimestamps[activeTimestamps.length - 1]
    : '';

  // Generate GitHub blob URL
  const githubBlobUrl = `https://github.com/filipbiernat/RScraper/blob/master/data/${fileName}`;

  return {
    fileName,
    timestamps: activeTimestamps,
    terms,
    lastUpdated,
    githubBlobUrl,
    offerUrl
  };
};

/**
 * Fetch and parse CSV file from the data directory
 */
export const loadCsvFile = async (fileName: string): Promise<CsvData> => {
  try {
    // Construct URL for CSV file directly from GitHub
    const csvUrl = `https://raw.githubusercontent.com/filipbiernat/RScraper/master/data/${fileName}`;

    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${fileName}: ${response.status} ${response.statusText}`);
    }

    const csvContent = await response.text();

    return parseCsvContent(csvContent, fileName);
  } catch (error) {
    console.error(`Error loading CSV file ${fileName}:`, error);
    throw error;
  }
};

/**
 * Check if a CSV file exists by attempting to fetch it
 */
export const checkCsvFileExists = async (fileName: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://raw.githubusercontent.com/filipbiernat/RScraper/master/data/${fileName}`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};