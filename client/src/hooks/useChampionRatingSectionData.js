import { useState, useEffect, useCallback } from 'react';
import { fetchChampionSpecificStats } from '../api/championApi';

/**
 * Reusable hook to fetch champion data for both Rating and Skin pages.
 * Supports partial fetching via the `include` option.
 * 
 * @param {string} championName - The champion's ID/Name
 * @param {Object} options - { include: 'skins' | 'ratings' }
 */
export const useChampionRatingSectionData = (championName, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSkin, setCurrentSkin] = useState(null); // Useful for skin page

  const { include } = options;

  useEffect(() => {
    if (!championName) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchChampionSpecificStats(championName, include);
        
        if (response.success && response.data) {
          setData(response.data);
          console.log(response.data);
        } else {
          setError(response.message || 'Failed to fetch champion data');
        }
      } catch (err) {
        console.error("Error in useChampionRatingSectionData:", err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [championName, include]);

  const updateCurrentSkin = useCallback((skin) => {
    setCurrentSkin(skin);
  }, []);

  return { 
    data, 
    loading, 
    error,
    currentSkin,
    updateCurrentSkin
  };
};

