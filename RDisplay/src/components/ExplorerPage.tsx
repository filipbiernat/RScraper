/**
 * Explorer page — existing filter panel + data table view, extracted from App
 * Supports URL search params for pre-filling filters from deal card clicks
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { SourcesConfig } from '../types/sources';
import type { FilterState } from '../types/filters';
import { AppLayout } from './Layout/AppLayout';
import { FilterPanel } from './FilterPanel/FilterPanel';
import { DataTable } from './DataTable/DataTable';
import { useFilters } from '../hooks/useFilters';
import { useCsvData } from '../hooks/useCsvData';

interface ExplorerPageProps {
  sourcesConfig: SourcesConfig | null;
  configLoading: boolean;
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({ sourcesConfig, configLoading }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [initialFiltersApplied, setInitialFiltersApplied] = useState(false);

  // Generate dynamic title based on filters
  const generateTitle = (filters: FilterState): string => {
    const parts: string[] = [];

    if (filters.country) {
      parts.push(filters.country);
    }

    if (filters.trip) {
      parts.push(filters.trip);
    }

    if (filters.departureAirport) {
      parts.push(filters.departureAirport);
    }

    if (filters.persons) {
      parts.push(`${filters.persons} ${t('app.person', { count: filters.persons })}`);
    }

    const baseTitle = parts.length > 0 ? parts.join(' • ') : t('app.defaultTitle');
    return `${baseTitle} – ${t('app.titleSuffix')}`;
  };

  // Use custom hooks for filter management and CSV data loading
  const {
    filters,
    availableOptions,
    updateFilter,
    currentFileName
  } = useFilters(sourcesConfig);

  const {
    data: csvData,
    loading: csvLoading,
    error: csvError
  } = useCsvData(currentFileName);

  // Apply filters from URL search params (from deal card click)
  useEffect(() => {
    if (initialFiltersApplied || !sourcesConfig) return;

    const country = searchParams.get('country');
    const trip = searchParams.get('trip');
    const airport = searchParams.get('airport');
    const persons = searchParams.get('persons');

    if (country) {
      updateFilter('country', country);

      // Use timeouts to allow cascading filter effects to settle
      if (trip) {
        setTimeout(() => {
          updateFilter('trip', trip);
          if (airport) {
            setTimeout(() => {
              updateFilter('departureAirport', airport);
              if (persons) {
                setTimeout(() => {
                  updateFilter('persons', parseInt(persons, 10));
                }, 100);
              }
            }, 100);
          }
        }, 100);
      }
    }

    setInitialFiltersApplied(true);
  }, [sourcesConfig, searchParams, initialFiltersApplied, updateFilter]);

  // Generate current title
  const currentTitle = generateTitle(filters);

  // Update document title when filters change
  useEffect(() => {
    document.title = currentTitle;
  }, [currentTitle]);

  const handleNavigateToDeals = () => {
    navigate('/');
  };

  const sidebar = (
    <FilterPanel
      filters={filters}
      availableOptions={availableOptions}
      onFilterChange={updateFilter}
      loading={configLoading}
    />
  );

  const mainContent = (
    <DataTable
      data={csvData}
      loading={csvLoading}
      error={csvError}
    />
  );

  return (
    <AppLayout sidebar={sidebar} title={currentTitle} onNavigateToDeals={handleNavigateToDeals}>
      {mainContent}
    </AppLayout>
  );
};
