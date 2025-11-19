import { useState, useEffect, useCallback } from 'react';
import { fetchChampionSkinsFromAPI } from '../../../api/championApi';
import { getSkinImageUrl as buildSkinImageUrl } from '../utils/getSkinImageUrl';

const useSkinData = (championName) => {
  const [skins, setSkins] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [preloadedImages, setPreloadedImages] = useState(new Set());

  // Function for generating Community Dragon CDN URL
  const getSkinImageUrl = useCallback((skin) => buildSkinImageUrl(skin), []);

  // Legacy function for backward compatibility
  const communityDragonUrl = useCallback(
    (splashPath) => getSkinImageUrl({ splashPath }),
    [getSkinImageUrl]
  );

  // Preload images for better performance
  const preloadImages = useCallback((skinsData) => {
    skinsData.forEach((skin, index) => {
      const imageUrl = getSkinImageUrl(skin);
      if (imageUrl) {
        const img = new Image();
        
        img.onload = () => {
          setPreloadedImages(prev => {
            const newSet = new Set(prev);
            newSet.add(imageUrl);
            return newSet;
          });
          setImageLoadingStates(prev => ({ ...prev, [index]: 'loaded' }));
        };
        
        img.onerror = () => {
          setImageLoadingStates(prev => ({ ...prev, [index]: 'error' }));
        };
        
        // Set loading state first
        setImageLoadingStates(prev => ({ ...prev, [index]: 'loading' }));
        img.src = imageUrl;
      }
    });
  }, [getSkinImageUrl]);

  useEffect(() => {
    const loadSkins = async () => {
      if (!championName) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setCurrentIndex(0); // Reset index when loading new champion
        
        const response = await fetchChampionSkinsFromAPI(championName);
        
        if (response.success && response.data) {
          setSkins(response.data);
          // Preload images after skins are loaded
          preloadImages(response.data);
        } else {
          setError('Failed to load skins');
          setSkins([]);
        }
      } catch (err) {
        setError(`Failed to load skins: ${err.message}`);
        setSkins([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkins();
  }, [championName, preloadImages]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % skins.length);
  }, [skins.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + skins.length) % skins.length);
  }, [skins.length]);

  const goToSlide = useCallback((index) => {
    if (index >= 0 && index < skins.length) {
      setCurrentIndex(index);
    }
  }, [skins.length]);

  const currentSkin = skins[currentIndex] || null;

  return {
    skins,
    currentSkin,
    currentIndex,
    isLoading,
    error,
    imageLoadingStates,
    preloadedImages,
    goToNext,
    goToPrevious,
    goToSlide,
  };
};

export default useSkinData; 