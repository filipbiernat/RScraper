/**
 * CSV parsing utilities for loading and processing travel data
 */

import type { CsvData, TripTerm, PriceEntry, ParsedCsvRow } from '../types/csvData';
import { parseDateFromTerm, parseEndDateFromTerm, isTripPast, groupTermsByYear } from './dateUtils';
import { configManager } from './configManager';

/**
 * Parse CSV text content into structured data
 */
export const parseCsvContent = async (csvContent: string, fileName: string): Promise<CsvData> => {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('Invalid CSV format: insufficient data');
  }

  // Parse header row (timestamps)
  const headerRow = lines[0].split(',');
  const originalTimestamps = headerRow.slice(1); // Skip first empty column

  // Create timestamp-index pairs for sorting
  const timestampIndexPairs = originalTimestamps.map((timestamp, index) => ({
    timestamp,
    originalIndex: index
  }));

  // Sort timestamps from newest to oldest
  timestampIndexPairs.sort((a, b) => {
    // Parse timestamps in format "dd.mm.yyyy hh:mm:ss"
    const parseTimestamp = (ts: string): Date => {
      const [date, time] = ts.split(' ');
      const [day, month, year] = date.split('.');
      const [hour, minute, second] = time.split(':');
      return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1, // Month is 0-based
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        parseInt(second, 10)
      );
    };

    const dateA = parseTimestamp(a.timestamp);
    const dateB = parseTimestamp(b.timestamp);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });

  // Extract sorted timestamps and create mapping
  const timestamps = timestampIndexPairs.map(pair => pair.timestamp);
  const indexMapping = timestampIndexPairs.map(pair => pair.originalIndex);

  // Parse data rows
  const parsedRows: ParsedCsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    const dateRange = row[0];
    const originalPrices = row.slice(1).map(priceStr => {
      const price = parseInt(priceStr, 10);
      return isNaN(price) ? null : price;
    });

    // Reorder prices according to timestamp sorting
    const prices = indexMapping.map(originalIndex => originalPrices[originalIndex]);

    parsedRows.push({ dateRange, prices });
  }  // Filter out past trips
  const futureRows = parsedRows.filter(row => !isTripPast(row.dateRange));

  // Filter out sold out trips (no current price in the newest timestamp)
  const availableRows = futureRows.filter(row => {
    const currentPrice = row.prices[0]; // First price is from newest timestamp
    return currentPrice !== null && currentPrice !== undefined && currentPrice > 0;
  });

  // Filter timestamps that have at least one valid price entry
  const activeTimestamps = timestamps.filter((_, index) =>
    availableRows.some(row => row.prices[index] !== null && row.prices[index] !== undefined)
  );

  // Remove the newest timestamp from history columns to avoid duplication with "Current Price"
  const historyTimestamps = activeTimestamps.slice(1);

  // Convert to TripTerm objects
  const terms: TripTerm[] = availableRows.map(row => {
    // Current price is from the first (newest) timestamp
    const currentPrice = row.prices[0] || 0;

    // Price history excludes the current (newest) price to avoid duplication
    const priceHistory: PriceEntry[] = historyTimestamps
      .map((timestamp, index) => ({
        timestamp,
        price: row.prices[index + 1] || 0  // +1 because we skip the first (current) price
      }))
      .filter(entry => entry.price > 0); // Only valid prices

    return {
      dateRange: row.dateRange,
      startDate: parseDateFromTerm(row.dateRange),
      endDate: parseEndDateFromTerm(row.dateRange),
      priceHistory,
      currentPrice
    };
  });

  // Determine last updated timestamp (first in sorted array = newest)
  const lastUpdated = activeTimestamps.length > 0
    ? activeTimestamps[0]
    : '';

  // Group terms by year
  const yearGroups = groupTermsByYear(terms);

  // Generate offer URL if possible
  let offerUrl: string | undefined;
  try {
    offerUrl = await configManager.buildOfferUrl(fileName) || undefined;
  } catch (error) {
    console.warn(`Failed to generate offer URL for ${fileName}:`, error);
  }

  return {
    fileName,
    timestamps: historyTimestamps,
    terms,
    yearGroups,
    lastUpdated,
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

    return await parseCsvContent(csvContent, fileName);
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