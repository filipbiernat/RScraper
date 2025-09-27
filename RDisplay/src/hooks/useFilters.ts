/**
 * Custom hook for managing filter state and available options
 */

import { useState, useEffect, useMemo } from 'react';
import type { FilterState, AvailableOptions } from '../types/filters';
import type { SourcesConfig, TripCombination } from '../types/sources';
import { buildFileName } from '../utils/transliteration';
import { checkCsvFileExists } from '../utils/csvParser';

/**
 * Custom hook for smart cascading filters
 */
export const useFilters = (sourcesConfig: SourcesConfig | null) => {
  const [filters, setFilters] = useState<FilterState>({
    country: null,
    trip: null,
    departureAirport: null,
    persons: null
  });

  const [availableOptions, setAvailableOptions] = useState<AvailableOptions>({
    countries: [],
    trips: [],
    departureAirports: [],
    persons: []
  });

  // Generate all possible trip combinations from sources config
  const allCombinations = useMemo((): TripCombination[] => {
    if (!sourcesConfig) return [];

    const combinations: TripCombination[] = [];
    const defaults = sourcesConfig.defaults;

    Object.entries(sourcesConfig.trips).forEach(([tripName, tripConfig]) => {
      const departureLocations = tripConfig.departure_locations || defaults.departure_locations;
      const personCounts = tripConfig.person_counts || defaults.person_counts;

      departureLocations.forEach(airport => {
        personCounts.forEach(persons => {
          const fileName = buildFileName(tripConfig.country, tripName, airport, persons);
          combinations.push({
            country: tripConfig.country,
            tripName,
            departureAirport: airport,
            persons,
            fileName
          });
        });
      });
    });

    return combinations;
  }, [sourcesConfig]);

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

  // Get available airports for selected country and trip
  const departureAirports = useMemo(() => {
    if (!sourcesConfig || !filters.country || !filters.trip) return [];

    const tripConfig = sourcesConfig.trips[filters.trip];
    if (!tripConfig) return [];

    return tripConfig.departure_locations || sourcesConfig.defaults.departure_locations;
  }, [sourcesConfig, filters.country, filters.trip]);

  // Get available person counts for selected combination (based on existing CSV files)
  const [availablePersons, setAvailablePersons] = useState<number[]>([]);

  useEffect(() => {
    const checkAvailablePersons = async () => {
      if (!filters.country || !filters.trip || !filters.departureAirport) {
        setAvailablePersons([]);
        return;
      }

      const allPersonCounts = sourcesConfig?.defaults.person_counts || [1, 2];
      const availableCounts: number[] = [];

      for (const persons of allPersonCounts) {
        const fileName = buildFileName(filters.country, filters.trip, filters.departureAirport, persons);
        const exists = await checkCsvFileExists(fileName);
        if (exists) {
          availableCounts.push(persons);
        }
      }

      setAvailablePersons(availableCounts);
    };

    checkAvailablePersons();
  }, [filters.country, filters.trip, filters.departureAirport, sourcesConfig]);

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

  // Reset cascade when higher level filter changes
  const updateFilter = (key: keyof FilterState, value: string | number | null) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };

      // Reset dependent filters
      if (key === 'country') {
        newFilters.trip = null;
        newFilters.departureAirport = null;
        newFilters.persons = null;
      } else if (key === 'trip') {
        newFilters.departureAirport = null;
        newFilters.persons = null;
      } else if (key === 'departureAirport') {
        newFilters.persons = null;
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
    currentFileName,
    allCombinations
  };
};