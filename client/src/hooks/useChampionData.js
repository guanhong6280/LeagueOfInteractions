import { useState, useEffect, useMemo } from 'react';
import { fetchChampionNames } from '../api/championApi';

export const useChampionData = () => {
  const [championNames, setChampionNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChampionNames = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetchChampionNames();
        const names = Object.keys(response.data);
        console.log(names);
        setChampionNames(names);
      } catch (err) {
        console.error('Error fetching champion names:', err);
        setError(err.message || 'Failed to load champion data');
      } finally {
        setIsLoading(false);
      }
    };

    loadChampionNames();
  }, []);

  const value = useMemo(() => ({
    championNames,
    isLoading,
    error,
  }), [championNames, isLoading, error]);

  return value;
}; 