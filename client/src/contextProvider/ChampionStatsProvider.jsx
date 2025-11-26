import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchChampionStats } from '../api/championApi';

const ChampionStatsContext = createContext();

export const useChampionStats = () => {
  const context = useContext(ChampionStatsContext);
  if (!context) {
    throw new Error('useChampionStats must be used within a ChampionStatsProvider');
  }
  return context;
};

export const ChampionStatsProvider = ({ children }) => {
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initial data fetch when provider mounts
  useEffect(() => {
    const initializeStats = async () => {
      setIsLoading(true);
      try {
        const championStats = await fetchChampionStatsData();
        setStats(championStats);
        console.log(championStats);
      } catch (error) {
        console.error('Failed to initialize champion stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStats();
  }, []); // Empty dependency array = run once on mount

  // Use centralized axios layer for API calls
  const fetchChampionStatsData = async () => {
    try {
      const result = await fetchChampionStats();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch champion stats');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching champion stats:', error);
      throw error;
    }
  };

  const refreshAllStats = async (championNames) => {
    setIsLoading(true);
    
    try {
      // Fetch real data from our aggregation pipeline
      const championStats = await fetchChampionStatsData();
      
      setStats(championStats);
    } catch (error) {
      console.error('Failed to fetch champion stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    stats,
    isLoading,
    refreshAllStats
  };

  return (
    <ChampionStatsContext.Provider value={value}>
      {children}
    </ChampionStatsContext.Provider>
  );
}; 