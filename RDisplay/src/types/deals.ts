/**
 * Type definitions for deals data loaded from deals.json
 */

export interface Deal {
  country: string;
  trip: string;
  airport: string;
  persons: number;
  dateRange: string;
  currentPrice: number;
  previousPrice: number | null;
  allTimeMin: number;
  allTimeMax: number;
  score: number;
  reason: string;
  csvFileName: string;
  offerUrl: string;
}

export interface DealSection {
  label: string;
  deals: Deal[];
}

export interface DealsData {
  generatedAt: string;
  sections: {
    combined: DealSection;
    priceDrops: DealSection;
    lowestPerTrip: DealSection;
    allTimeLow: DealSection;
  };
}
