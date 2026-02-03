import React, { useState, useEffect, useCallback } from 'react';
import * as MUI from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import { SkinCarousel } from '../components/carousel';
import { ChampionSkinStatsSection } from '../components/stats';
import { SkinRatingSection, SkinCommentSection } from '../components/sections';
import { ReturnButton } from '../components/common';
import { useRatingSectionData } from '../../../hooks/useRatingSectionData'; // Use reusable hook
import { NeoCard } from '../components/design/NeoComponents';

const ChampionSkinRatingPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('rating');

  // Unified data management with query params for 'skins'
  const {
    data: statsData,
    error,
  } = useRatingSectionData(id, { include: 'skins' });

  const championData = React.useMemo(() => { 
    if (!statsData) return null;
    return {
      name: statsData.championName,
      title: statsData.title,
      roles: statsData.roles,
      stats: statsData, 
    };
  }, [statsData]);

  const championName = championData?.name || '';
  const stats = championData?.stats || {};

  const [currentSkin, setCurrentSkin] = useState(null);

  // Source of truth for which skin is selected (URL or state) — keeps selection after refetch (e.g. rating submit)
  const selectedSkinId = searchParams.get('skinId') || currentSkin?.skinId;

  // Handle skin selection change
  const handleSkinChange = useCallback((skin) => {
    setCurrentSkin(skin);
    // Update URL parameter without reloading page
    if (skin?.skinId) {
      setSearchParams({ skinId: skin.skinId }, { replace: true });
    }
  }, [setSearchParams]);

  return (
    <MUI.Container
      maxWidth="lg"
      sx={{ py: 4 }}
    >
      {/* Return Button - Fixed Position */}
      <ReturnButton />

      {/* Page Header - could add breadcrumbs here later */}

      {/* Champion Stats Section */}
      <MUI.Box sx={{ mb: 4 }}>
        <ChampionSkinStatsSection
          championName={championName}
          championTitle={championData?.title || ''}
          stats={stats}
          error={error}
          onRetry={() => window.location.reload()}
        />
      </MUI.Box>

      {/* Skin Carousel Section */}
      <MUI.Box sx={{ mb: 4 }}>
        <SkinCarousel
          championName={championName}
          onSkinChange={handleSkinChange}
          selectedSkinId={selectedSkinId}
        />
      </MUI.Box>

      {/* Section Navigation */}
      <MUI.Box id="section-navigation" sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <MUI.Box
          sx={{
            display: 'flex',
            border: '3px solid #000',
            boxShadow: '6px 6px 0px #000',
            bgcolor: 'white',
          }}
        >
          <MUI.ButtonBase
            onClick={() => setActiveSection('rating')}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              bgcolor: activeSection === 'rating' ? 'black' : 'white',
              color: activeSection === 'rating' ? 'white' : 'black',
              borderRight: '3px solid #000',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: activeSection === 'rating' ? 'black' : '#FFF9C4',
              }
            }}
          >
            Rate Skins
          </MUI.ButtonBase>
          <MUI.ButtonBase
            onClick={() => setActiveSection('comment')}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              bgcolor: activeSection === 'comment' ? 'black' : 'white',
              color: activeSection === 'comment' ? 'white' : 'black',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: activeSection === 'comment' ? 'black' : '#E1BEE7',
              }
            }}
          >
            Comments
          </MUI.ButtonBase>
        </MUI.Box>
      </MUI.Box>

      {/* Interactive Sections */}
      <MUI.Box
        maxWidth={1200}
        mx='auto'
      >
        {activeSection === 'rating' ? (
          <MUI.Box id="rating-section">
            <SkinRatingSection
              currentSkinId={currentSkin?.skinId}
              skinStats={currentSkin}
              championId={id}
              championName={championName}
            />
          </MUI.Box>
        ) : (
          <MUI.Box id="comment-section">
            <NeoCard>
              <SkinCommentSection
                currentSkinId={currentSkin?.skinId}
              />
            </NeoCard>
          </MUI.Box>
        )}
      </MUI.Box>
    </MUI.Container>
  );
};

export default ChampionSkinRatingPage;
