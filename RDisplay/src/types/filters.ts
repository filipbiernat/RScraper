/**
 * Type definitions for filter state and options
 */

export interface FilterState {
  country: string | null;
  trip: string | null;
  departureAirport: string | null;
  persons: number | null;
}

export interface AvailableOptions {
  countries: string[];
  trips: string[];
  departureAirports: string[];
  persons: number[];
}

export type FilterKey = keyof FilterState;