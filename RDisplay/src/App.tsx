/**
 * Main App component with Material-UI theme, routing, and data management
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { SourcesConfig } from './types/sources';
import { DealsPage } from './components/DealsPage/DealsPage';
import { ExplorerPage } from './components/ExplorerPage';
import { LastMinutePage } from './components/LastMinutePage/LastMinutePage';

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

  // Load sources.json configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const isDev = import.meta.env.DEV;
        const url = isDev 
          ? '/RScraper/sources.json'
          : 'https://raw.githubusercontent.com/filipbiernat/RScraper/master/sources.json';
          
        const response = await fetch(url);
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

  // Render error state for configuration loading
  if (configError) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Configuration Error</h2>
          <p>{configError}</p>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter basename="/RScraper/">
        <Routes>
          <Route path="/" element={<DealsPage />} />
          <Route path="/last-minute" element={<LastMinutePage />} />
          <Route
            path="/explorer"
            element={
              <ExplorerPage
                sourcesConfig={sourcesConfig}
                configLoading={configLoading}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
