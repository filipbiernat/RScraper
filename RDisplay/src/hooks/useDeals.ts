/**
 * Custom hook for loading deals data from deals.json
 */

import { useState, useEffect } from 'react';
import type { DealsData } from '../types/deals';

interface UseDealsResult {
  data: DealsData | null;
  loading: boolean;
  error: string | null;
}

export const useDeals = (): UseDealsResult => {
  const [data, setData] = useState<DealsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const isDev = import.meta.env.DEV;
        const url = isDev 
          ? '/RScraper/data/deals.json'
          : 'https://raw.githubusercontent.com/filipbiernat/RScraper/master/data/deals.json';
          
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to load deals: ${response.status}`);
        }

        const dealsData: DealsData = await response.json();
        setData(dealsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error loading deals.json:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, []);

  return { data, loading, error };
};
