/**
 * Custom hook for managing filter state and available options
 */

import { useState, useEffect, useMemo } from 'react';
import type { FilterState, AvailableOptions } from '../types/filters';
import type { SourcesConfig } from '../types/sources';
import { buildFileName } from '../utils/transliteration';
import {
  fetchCsvFileEntries,
  getAvailableAirports,
  getAvailablePersonCounts,
  type CsvFileEntry
} from '../utils/csvFileDiscovery';

/**
 * Custom hook for smart cascading filters
 */
export const useFilters = (sourcesConfig: SourcesConfig | null) => {
  const [filters, setFilters] = useState<FilterState>({
    country: null,
    trip: null,
    departureAirport: null,
    persons: 1
  });

  const [availableOptions, setAvailableOptions] = useState<AvailableOptions>({
    countries: [],
    trips: [],
    departureAirports: [],
    persons: []
  });

  // CSV file entries discovered from the data/ folder
  const [csvFileEntries, setCsvFileEntries] = useState<CsvFileEntry[]>([]);

  // Fetch CSV file listing on mount
  useEffect(() => {
    fetchCsvFileEntries()
      .then(entries => setCsvFileEntries(entries))
      .catch(err => console.error('Error fetching CSV file list:', err));
  }, []);

  // Get available countries
  const countries = useMemo(() => {
    if (!sourcesConfig) return [];
    return Array.from(new Set(Object.values(sourcesConfig.trips).map(trip => trip.country)));
  }, [sourcesConfig]);

  // Get available trips for selected country
  const trips = useMemo(() => {
    if (!sourcesConfig || !filters.country) return [];
    return Object.entries(sourcesConfig.trips)
      .filter(([, tripConfig]) => tripConfig.country === filters.country)
      .map(([tripName]) => tripName);
  }, [sourcesConfig, filters.country]);

  // Get available airports for selected trip – derived from actual CSV files
  const departureAirports = useMemo(() => {
    if (!filters.country || !filters.trip || csvFileEntries.length === 0) return [];
    return getAvailableAirports(csvFileEntries, filters.country, filters.trip);
  }, [csvFileEntries, filters.country, filters.trip]);

  const configPersons = useMemo(() => {
    if (!sourcesConfig) return [];

    const tripPersons = filters.trip
      ? sourcesConfig.trips[filters.trip]?.person_counts
      : undefined;

    return [...(tripPersons ?? sourcesConfig.defaults.person_counts)].sort((a, b) => a - b);
  }, [sourcesConfig, filters.trip]);

  // Get available person counts – use config as a resilient baseline,
  // then narrow to discovered CSV-backed values for the selected route.
  const availablePersons = useMemo(() => {
    if (
      !filters.country ||
      !filters.trip ||
      !filters.departureAirport ||
      csvFileEntries.length === 0
    ) {
      return configPersons;
    }

    const discoveredPersons = getAvailablePersonCounts(
      csvFileEntries,
      filters.country,
      filters.trip,
      filters.departureAirport
    ).sort((a, b) => a - b);

    return discoveredPersons.length > 0 ? discoveredPersons : configPersons;
  }, [
    configPersons,
    csvFileEntries,
    filters.country,
    filters.trip,
    filters.departureAirport
  ]);

  // Update available options when filters change
  useEffect(() => {
    setAvailableOptions({
      countries,
      trips,
      departureAirports,
      persons: availablePersons
    });
  }, [countries, trips, departureAirports, availablePersons]);

  // Auto-select when only one option available
  useEffect(() => {
    if (countries.length === 1 && !filters.country) {
      setFilters(prev => ({ ...prev, country: countries[0] }));
    }
  }, [countries, filters.country]);

  useEffect(() => {
    if (trips.length === 1 && !filters.trip) {
      setFilters(prev => ({ ...prev, trip: trips[0] }));
    }
  }, [trips, filters.trip]);

  useEffect(() => {
    if (departureAirports.length === 1 && !filters.departureAirport) {
      setFilters(prev => ({ ...prev, departureAirport: departureAirports[0] }));
    }
  }, [departureAirports, filters.departureAirport]);

  useEffect(() => {
    if (availablePersons.length === 1 && !filters.persons) {
      setFilters(prev => ({ ...prev, persons: availablePersons[0] }));
    }
  }, [availablePersons, filters.persons]);

  useEffect(() => {
    if (filters.persons && availablePersons.length > 0 && !availablePersons.includes(filters.persons)) {
      setFilters(prev => ({ ...prev, persons: null }));
    }
  }, [availablePersons, filters.persons]);

  // Reset cascade when higher level filter changes
  const updateFilter = (key: keyof FilterState, value: string | number | null) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };

      // Reset dependent filters
      if (key === 'country') {
        newFilters.trip = null;
        newFilters.departureAirport = null;
      } else if (key === 'trip') {
        newFilters.departureAirport = null;
      }

      return newFilters;
    });
  };

  // Get current CSV filename if all filters are selected
  const currentFileName = useMemo(() => {
    if (!filters.country || !filters.trip || !filters.departureAirport || !filters.persons) {
      return null;
    }
    return buildFileName(filters.country, filters.trip, filters.departureAirport, filters.persons);
  }, [filters]);

  return {
    filters,
    availableOptions,
    updateFilter,
    currentFileName
  };
};