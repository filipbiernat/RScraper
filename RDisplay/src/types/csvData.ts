/**
 * Type definitions for CSV data structure
 */

export interface PriceEntry {
  timestamp: string;
  price: number;
}

export interface TripTerm {
  dateRange: string;
  startDate: Date;
  endDate: Date;
  priceHistory: PriceEntry[];
  currentPrice: number;
}

export interface CsvData {
  fileName: string;
  timestamps: string[];
  terms: TripTerm[];
  lastUpdated: string;
  githubBlobUrl: string;
  offerUrl?: string;
}

export interface ParsedCsvRow {
  dateRange: string;
  prices: (number | null)[];
}