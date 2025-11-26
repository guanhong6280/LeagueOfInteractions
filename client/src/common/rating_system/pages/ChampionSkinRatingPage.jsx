import React, { useState, useEffect, useCallback } from 'react';
import * as MUI from '@mui/material';
import { useParams } from 'react-router-dom';
import { SkinCarousel } from '../components/carousel';
import { ChampionStatsCard } from '../components/stats';
import { SkinRatingSection, SkinCommentSection } from '../components/sections';
import { getChampionSquareAssetUrl } from '../../../utils/championNameUtils';
import { useVersion } from '../../../contextProvider/VersionProvider';
import { ReturnButton } from '../components/common';
import { useChampionRatingSectionData } from '../../../hooks/useChampionRatingSectionData'; // Use reusable hook

const ChampionSkinRatingPage = () => {
  const { championName } = useParams();
  const [activeSection, setActiveSection] = useState('rating');
  const { version } = useVersion();

  // Unified data management with query params for 'skins'
  const { 
    data: stats, 
    loading: isLoading, 
    error, 
    currentSkin, 
    updateCurrentSkin 
  } = useChampionRatingSectionData(championName, { include: 'skins' });

  // Construct details from stats if available
  const championDetails = stats ? {
      name: championName,
      title: stats.title,
      tags: stats.roles || stats.tags,
  } : null;

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

export default ChampionSkinRatingPage;