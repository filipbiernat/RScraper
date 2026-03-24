import { useEffect, useState } from 'react';
import type { LastMinuteData } from '../types/lastMinute';

interface UseLastMinuteDataResult {
  data: LastMinuteData | null;
  loading: boolean;
  error: string | null;
}

export const useLastMinuteData = (): UseLastMinuteDataResult => {
  const [data, setData] = useState<LastMinuteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLastMinuteData = async () => {
      try {
        const isDev = import.meta.env.DEV;
        const url = isDev
          ? '/RScraper/data/last-minute.json'
          : 'https://raw.githubusercontent.com/filipbiernat/RScraper/master/data/last-minute.json';

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load last minute feed: ${response.status}`);
        }

        const lastMinuteData: LastMinuteData = await response.json();
        setData(lastMinuteData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error loading last-minute.json:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLastMinuteData();
  }, []);

  return { data, loading, error };
};