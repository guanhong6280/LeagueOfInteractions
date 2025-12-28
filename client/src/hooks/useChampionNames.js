import { useQuery } from '@tanstack/react-query';
import { fetchChampionNames } from '../api/championApi.js';

export const useChampionNames = () => {
  return useQuery({
    queryKey: ['champion-names'],
    queryFn: fetchChampionNames,
    // Transformation Logic: Runs only when data changes
    select: (response) => {
      // Handle the specific data structure from your API
      const data = response?.data || response;
      const names = Object.keys(data);
      
      if (!Array.isArray(names)) {
        console.error('Fetched champion names format is incorrect:', names);
        return [];
      }
      return names;
    },
    // Optimization: Champion names practically never change during a session
    staleTime: Infinity, 
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
  });
};