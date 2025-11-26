import React, { useMemo } from 'react';
import { fetchChampionNames } from '../api/championApi';

const ChampionContext = React.createContext();

export const useChampion = () => {
  const context = React.useContext(ChampionContext);
  if (!context) {
    throw new Error('useChampion must be used within a ChampionProvider');
  }
  return context;
};

const ChampionProvider = ({ children }) => {
  const [championNames, setChampionNames] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const getChampionNames = async () => {
      try {
        setIsLoading(true);
        // fetchChampionNames returns the response body (axiosResponse.data)
        const response = await fetchChampionNames();
        
        // Ensure we are accessing the correct data structure
        // Assuming response structure is { type: '...', data: { ...champions... } }
        const data = response?.data || response; 
        const names = Object.keys(data);

        if (Array.isArray(names)) {
          setChampionNames(names);
        } else {
          console.error('Fetched champion names format is incorrect:', names);
          setError('Invalid data format');
        }
      } catch (err) {
        console.error('Failed to fetch champion names:', err);
        setError(err.message || 'Failed to fetch champions');
      } finally {
        setIsLoading(false);
      }
    };

    getChampionNames();
  }, []);

  // Memoize the value to prevent unnecessary re-renders in consumers
  const value = useMemo(() => ({
    championNames,
    isLoading,
    error
  }), [championNames, isLoading, error]);

  return (
    <ChampionContext.Provider value={value}>
      {children}
    </ChampionContext.Provider>
  );
};

export default ChampionProvider;
