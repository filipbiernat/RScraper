/**
 * Main filter panel component that combines all filter selectors
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Toolbar
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { FilterState, AvailableOptions } from '../../types/filters';
import { CountrySelector } from './CountrySelector';
import { TripSelector } from './TripSelector';
import { AirportSelector } from './AirportSelector';
import { PersonSelector } from './PersonSelector';

interface FilterPanelProps {
  filters: FilterState;
  availableOptions: AvailableOptions;
  onFilterChange: (key: keyof FilterState, value: string | number | null) => void;
  loading?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  availableOptions,
  onFilterChange,
  loading = false
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar spacer for mobile */}
      <Toolbar />

      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: 'transparent',
            height: '100%'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t('filter.title')}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {/* Country Selector */}
          <CountrySelector
            value={filters.country}
            options={availableOptions.countries}
            onChange={(value) => onFilterChange('country', value)}
            disabled={loading || availableOptions.countries.length === 0}
          />

          {/* Trip Selector */}
          <TripSelector
            value={filters.trip}
            options={availableOptions.trips}
            onChange={(value) => onFilterChange('trip', value)}
            disabled={loading || !filters.country || availableOptions.trips.length === 0}
          />

          {/* Airport Selector */}
          <AirportSelector
            value={filters.departureAirport}
            options={availableOptions.departureAirports}
            onChange={(value) => onFilterChange('departureAirport', value)}
            disabled={loading || !filters.trip || availableOptions.departureAirports.length === 0}
          />

          {/* Person Count Selector */}
          <PersonSelector
            value={filters.persons}
            options={availableOptions.persons}
            onChange={(value) => onFilterChange('persons', value)}
            disabled={loading || !filters.departureAirport || availableOptions.persons.length === 0}
          />

          {/* Filter Summary */}
          <Box sx={{ mt: 3, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {t('filter.selectedFilters')}
            </Typography>
            <Typography variant="body2">
              {filters.country || t('filter.noCountry')} → {filters.trip || t('filter.noTrip')} → {filters.departureAirport || t('filter.noAirport')} → {filters.persons ? t('filter.personsCount', { count: filters.persons }) : t('filter.noPersons')}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};