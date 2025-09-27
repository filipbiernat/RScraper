/**
 * Type definitions for sources.json configuration
 */

export interface TripConfig {
  country: string;
  base_url: string;
  departure_locations?: string[];
  person_counts?: number[];
}

export interface SourcesConfig {
  global_config: {
    age_param: string;
  };
  defaults: {
    departure_locations: string[];
    person_counts: number[];
  };
  trips: Record<string, TripConfig>;
}

export interface TripCombination {
  country: string;
  tripName: string;
  departureAirport: string;
  persons: number;
  fileName: string;
}