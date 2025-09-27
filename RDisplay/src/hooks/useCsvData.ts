/**
 * Custom hook for loading and managing CSV data
 */

import { useState, useEffect } from 'react';
import type { CsvData } from '../types/csvData';
import { loadCsvFile } from '../utils/csvParser';

interface UseCsvDataResult {
  data: CsvData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for loading CSV data
 */
export const useCsvData = (fileName: string | null): UseCsvDataResult => {
  const [data, setData] = useState<CsvData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (file: string) => {
    setLoading(true);
    setError(null);

    try {
      const csvData = await loadCsvFile(file);
      setData(csvData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fileName) {
      loadData(fileName);
    } else {
      setData(null);
      setError(null);
      setLoading(false);
    }
  }, [fileName]);

  const refetch = () => {
    if (fileName) {
      loadData(fileName);
    }
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};