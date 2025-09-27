/**
 * Main App component with Material-UI theme and data management
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { SourcesConfig } from './types/sources';
import type { FilterState } from './types/filters';
import { AppLayout } from './components/Layout/AppLayout';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { DataTable } from './components/DataTable/DataTable';
import { useFilters } from './hooks/useFilters';
import { useCsvData } from './hooks/useCsvData';

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [sourcesConfig, setSourcesConfig] = useState<SourcesConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

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
      parts.push(`${filters.persons} ${filters.persons === 1 ? 'osoba' : 'osoby'}`);
    }

    const baseTitle = parts.length > 0 ? parts.join(' • ') : 'Travel Data Visualization';
    return `${baseTitle} – RDisplay`;
  };

  // Load sources.json configuration directly from GitHub
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/filipbiernat/RScraper/master/sources.json');
        if (!response.ok) {
          throw new Error(`Failed to load configuration: ${response.status}`);
        }
        const config: SourcesConfig = await response.json();
        setSourcesConfig(config);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setConfigError(errorMessage);
        console.error('Error loading sources.json:', error);
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

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

  // Generate current title
  const currentTitle = generateTitle(filters);

  // Update document title when filters change
  useEffect(() => {
    document.title = currentTitle;
  }, [currentTitle]);

  // Render error state for configuration loading
  if (configError) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Configuration Error</h2>
          <p>{configError}</p>
          <p>Please ensure sources.json is available in the public directory.</p>
        </div>
      </ThemeProvider>
    );
  }

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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppLayout sidebar={sidebar} title={currentTitle}>
        {mainContent}
      </AppLayout>
    </ThemeProvider>
  );
};

export default App;
