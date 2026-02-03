// hooks/useSkinData.js
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchChampionSkins } from '../../../api/championApi';
import { getSkinImageUrl as buildSkinImageUrl } from '../utils/getSkinImageUrl';

const useSkinData = (championName, options = {}) => {
  const { selectedSkinId } = options; // When set, preserve this skin after refetch (e.g. after rating submit)
  // UI State (Local state is fine for this)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [preloadedImages, setPreloadedImages] = useState(new Set());

  // 1. REACT QUERY FETCH
  const { 
    data: skins = [], 
    isLoading, 
    error,
    isPlaceholderData 
  } = useQuery({
    queryKey: ['champion-skins', championName],
    queryFn: async () => {
      const response = await fetchChampionSkins(championName);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch skins');
      }
      return response.data || [];
    },
    // Only fetch if we have a name
    enabled: !!championName,
    // Skins don't change often, keep them fresh in cache "forever" during the session
    staleTime: Infinity,
    // If we switch champions, don't show the previous champion's skins while loading
    keepPreviousData: false, 
  });

  // 2. IMAGE HELPERS
  const getSkinImageUrl = useCallback((skin) => buildSkinImageUrl(skin), []);

  // 3. PRELOAD EFFECT
  // We use useEffect here because preloading is a "Side Effect" of data arriving
  useEffect(() => {
    if (!skins || skins.length === 0) return;

    // Reset loading states when skins change
    setImageLoadingStates({});

    // Preserve selected skin after refetch (e.g. after rating submit); otherwise reset to first
    if (selectedSkinId != null && selectedSkinId !== '') {
      const index = skins.findIndex(
        (s) => String(s.skinId) === String(selectedSkinId)
      );
      setCurrentIndex(index >= 0 ? index : 0);
    } else {
      setCurrentIndex(0);
    }

    skins.forEach((skin, index) => {
      const imageUrl = getSkinImageUrl(skin);
      if (imageUrl) {
        // Mark as loading initially
        setImageLoadingStates(prev => ({ ...prev, [index]: 'loading' }));

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
        img.src = imageUrl;
      }
    });
  }, [skins, getSkinImageUrl, championName, selectedSkinId]);

  // 4. NAVIGATION LOGIC
  const goToNext = useCallback(() => {
    if (skins.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % skins.length);
  }, [skins.length]);

  const goToPrevious = useCallback(() => {
    if (skins.length === 0) return;
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
    error: error ? error.message : null,
    imageLoadingStates,
    preloadedImages,
    goToNext,
    goToPrevious,
    goToSlide,
  };
};

export default useSkinData;