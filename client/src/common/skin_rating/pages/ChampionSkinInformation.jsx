import React, { useState, useEffect, useCallback } from 'react';
import * as MUI from '@mui/material';
import { useParams } from 'react-router-dom';
import { SkinCarousel } from '../components/carousel';
import { ChampionStatsCard } from '../components/stats';
import { SkinRatingSection, SkinCommentSection } from '../components/sections';
import { fetchChampionSpecificStats, fetchChampionList } from '../../../api/championApi';
import { getChampionSquareAssetUrl } from '../../../utils/championNameUtils';
import { useVersion } from '../../../contextProvider/VersionProvider';
import { ReturnButton } from '../components/common';

// Custom hook for unified data management
const useChampionData = (championName) => {
  const [state, setState] = useState({
    stats: null,
    championDetails: null,
    currentSkin: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!championName) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Load both stats and champion details in parallel
        const [statsResponse, championListResponse] = await Promise.all([
          fetchChampionSpecificStats(championName),
          fetchChampionList()
        ]);

        if (statsResponse.success) {
          // Find the specific champion details from the list
          const championDetails = championListResponse.champions?.find(
            champion => champion.name.toLowerCase() === championName.toLowerCase()
          );

          setState(prev => ({
            ...prev,
            stats: statsResponse.data,
            championDetails: championDetails || null,
            isLoading: false
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: 'Failed to load champion data',
            isLoading: false
          }));
        }
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: 'Failed to load champion data',
          isLoading: false
        }));
      }
    };

    loadData();
  }, [championName]);

  const updateCurrentSkin = useCallback((skin) => {
    setState(prev => ({ ...prev, currentSkin: skin }));
  }, []);

  return { ...state, updateCurrentSkin };
};

const ChampionSkinInformation = () => {
  const { championName } = useParams();
  const [activeSection, setActiveSection] = useState('rating');
  const { version } = useVersion();

  // Unified data management
  const { stats, championDetails, currentSkin, isLoading, error, updateCurrentSkin } = useChampionData(championName);

  return (
    <MUI.Container
      maxWidth="xl"
      sx={{ py: 4 }}
    >
      {/* Return Button - Fixed Position */}
      <ReturnButton />

      {/* Page Header - could add breadcrumbs here later */}

      {/* Champion Stats Section */}
      <MUI.Box sx={{ mb: 4 }}>
        <ChampionStatsCard
          championImageUrl={getChampionSquareAssetUrl(championName, version)}
          championName={championDetails?.name || championName}
          championTitle={championDetails?.title || ''}
          stats={stats}
          error={error}
          onRetry={() => window.location.reload()}
          onNavigateToRating={() => {
            // Scroll to rating section
            setActiveSection('rating');
            setTimeout(() => {
              const ratingSection = document.getElementById('rating-section');
              if (ratingSection) {
                ratingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100); // Small delay to ensure section renders
          }}
          onNavigateToComments={() => {
            // Set active section to comments and scroll
            setActiveSection('comment');
            setTimeout(() => {
              const commentSection = document.getElementById('comment-section');
              if (commentSection) {
                commentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100); // Small delay to ensure section renders
          }}
        />
      </MUI.Box>

      {/* Skin Carousel Section */}
      <MUI.Box sx={{ mb: 4 }}>
        <SkinCarousel
          championName={championName}
          onSkinChange={updateCurrentSkin}
        />
      </MUI.Box>

      {/* Section Navigation */}
      <MUI.Box id="section-navigation" sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <MUI.ButtonGroup variant="outlined" size="large">
          <MUI.Button
            variant={activeSection === 'rating' ? 'contained' : 'outlined'}
            onClick={() => setActiveSection('rating')}
          >
            Rate Skins
          </MUI.Button>
          <MUI.Button
            variant={activeSection === 'comment' ? 'contained' : 'outlined'}
            onClick={() => setActiveSection('comment')}
          >
            Comments
          </MUI.Button>
        </MUI.ButtonGroup>
      </MUI.Box>

      {/* Interactive Sections */}
      <MUI.Box
        maxWidth={1000}
        mx='auto'
      >
        {activeSection === 'rating' ? (
          <MUI.Box id="rating-section">
            <SkinRatingSection
              currentSkinId={currentSkin?.skinId}
              championName={championName}
            />
          </MUI.Box>
        ) : (
          <MUI.Box id="comment-section">
            <SkinCommentSection
              currentSkinId={currentSkin?.skinId}
              championName={championName}
            />
          </MUI.Box>
        )}
      </MUI.Box>
    </MUI.Container>
  );
};

export default ChampionSkinInformation;