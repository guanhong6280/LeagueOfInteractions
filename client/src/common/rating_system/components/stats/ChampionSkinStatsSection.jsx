import React, { useState } from 'react';
import * as MUI from '@mui/material';
import {
  Palette as PaletteIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Comment as CommentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useVersion } from '../../../../contextProvider/VersionProvider';
import { getChampionSquareAssetUrl } from '../../../../utils/championNameUtils';
import { NeoCard, StatCard, ChampionImage, NeoHighlightCard } from '../design/NeoComponents';
import RatingDistributionChart from './RatingDistributionChart';
import RarityDistributionChart from './RarityDistributionChart';
import theme from '../../../../theme/theme';

const PopularSkinsSection = ({ mostPopularSkin, highestRatedSkin }) => (
  <MUI.Box  
    sx={{
      border: '2px solid #000',
      p: 2,
      bgcolor: 'white',
      boxShadow: '4px 4px 0px #000'
    }}
  >
    <MUI.Typography variant="h6" fontWeight="900" textTransform="uppercase" mb={2}>
      Skin Highlights
    </MUI.Typography>

    <MUI.Stack spacing={2}>
      <NeoHighlightCard
        title="Most Popular"
        value={mostPopularSkin?.name || 'None'}
        color={theme.palette.button.redSide}
      />

      <NeoHighlightCard
        title="Highest Rated"
        value={highestRatedSkin?.name || 'None'}
        badgeValue={highestRatedSkin?.averageRating?.toFixed(1)}
        badgeIcon={<StarIcon />}
        color={theme.palette.button.blueSide}
      />
    </MUI.Stack>
  </MUI.Box>
);

const ChampionSkinStatsSection = ({
  championName,
  championTitle,
  stats,
  error,
  onRetry,
}) => {
  const { version } = useVersion();
  const [activeChart, setActiveChart] = useState('rating');

  if (error) {
    return (
      <NeoCard bgcolor="#FFEBEE">
        <MUI.Typography color="error" variant="h6">Failed to load statistics</MUI.Typography>
        <MUI.Button onClick={onRetry}>Retry</MUI.Button>
      </NeoCard>
    );
  }

  // Safe data access
  const safeStats = {
    totalSkins: stats?.totalSkins ?? 0,
    averageRating: stats?.averageRating ?? 0,
    totalRatings: stats?.totalRatings ?? 0,
    totalComments: stats?.totalComments ?? 0,
    mostPopularSkin: stats?.mostPopularSkin,
    highestRatedSkin: stats?.highestRatedSkin,
  };

  return (
    <MUI.Box
      component="section"
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        bgcolor: '#FFF9C4', // Neo-brutalist base color
        border: '3px solid #000',
        boxShadow: '8px 8px 0px #000',
        p: 3,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: '10px 10px 0px #000',
        }
      }}
    >
      <MUI.Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={4}
        sx={{ minHeight: 400 }}
      >
        {/* Left Stack: Champion Image + Identity + Popular Skins */}
        <MUI.Stack spacing={3} sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
          <MUI.Box
            sx={{
              border: '3px solid #000',
              bgcolor: 'white',
              p: 2,
              boxShadow: '4px 4px 0px #000'
            }}
          >
            <MUI.Stack direction="column" spacing={2} alignItems="center">
              {version && championName && (
                <ChampionImage
                  imageUrl={getChampionSquareAssetUrl(championName, version)}
                  championName={championName}
                />
              )}
              <MUI.Stack spacing={0.5} textAlign="center" width="100%">
                <MUI.Typography
                  variant="h4"
                  fontWeight="900"
                  textTransform="uppercase"
                  sx={{ lineHeight: 1, letterSpacing: -1 }}
                >
                  {championName}
                </MUI.Typography>
                <MUI.Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    bgcolor: 'black',
                    color: 'white',
                    py: 0.5,
                    px: 1,
                  }}
                >
                  {championTitle}
                </MUI.Typography>
              </MUI.Stack>
            </MUI.Stack>
          </MUI.Box>

          <PopularSkinsSection
            mostPopularSkin={safeStats.mostPopularSkin}
            highestRatedSkin={safeStats.highestRatedSkin}
          />
        </MUI.Stack>

        {/* Right Stack: Stats Grid + Charts */}
        <MUI.Stack sx={{ flex: 1, minWidth: 0 }} spacing={3}>
          {/* Stats Grid */}
          <MUI.Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 2,
            }}
          >
            <StatCard
              icon={PaletteIcon}
              label="Total Skins"
              value={safeStats.totalSkins}
              color="primary"
            />
            <StatCard
              icon={StarIcon}
              label="Avg. Rating"
              value={safeStats.averageRating.toFixed(1)}
              color="warning"
            />
            <StatCard
              icon={TrendingUpIcon}
              label="Total Ratings"
              value={safeStats.totalRatings}
              color="success"
            />
            <StatCard
              icon={CommentIcon}
              label="Total Comments"
              value={safeStats.totalComments}
              color="info"
            />
          </MUI.Box>

          {/* Compact Chart Widget */}
          <MUI.Box
            sx={{
              flex: 1,
              minHeight: 300,
              bgcolor: 'white',
              border: '3px solid #000',
              boxShadow: '6px 6px 0px #000',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Header / Tabs - "Folder Tab" Style */}
            <MUI.Box
              sx={{
                borderBottom: '3px solid #000',
                display: 'flex',
                bgcolor: '#eee',
              }}
            >
              <MUI.ButtonBase
                onClick={() => setActiveChart('rating')}
                sx={{
                  flex: 1,
                  py: 1.5,
                  px: 2,
                  bgcolor: activeChart === 'rating' ? 'white' : '#e0e0e0',
                  color: 'black',
                  fontWeight: '900',
                  borderRight: '3px solid #000',
                  borderBottom: activeChart === 'rating' ? '3px solid white' : 'none', // Hide bottom border when active
                  marginBottom: activeChart === 'rating' ? '-3px' : '0', // Overlap bottom border
                  zIndex: activeChart === 'rating' ? 1 : 0,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: activeChart === 'rating' ? 'white' : '#d0d0d0' },
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontFamily: 'inherit',
                }}
              >
                <PieChartIcon sx={{ fontSize: 20 }} />
                RATING DIST.
              </MUI.ButtonBase>
              <MUI.ButtonBase
                onClick={() => setActiveChart('rarity')}
                sx={{
                  flex: 1,
                  py: 1.5,
                  px: 2,
                  bgcolor: activeChart === 'rarity' ? 'white' : '#e0e0e0',
                  color: 'black',
                  fontWeight: '900',
                  borderRight: '3px solid #000', // Optional on last item
                  borderBottom: activeChart === 'rarity' ? '3px solid white' : 'none',
                  marginBottom: activeChart === 'rarity' ? '-3px' : '0',
                  zIndex: activeChart === 'rarity' ? 1 : 0,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: activeChart === 'rarity' ? 'white' : '#d0d0d0' },
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontFamily: 'inherit',
                }}
              >
                <BarChartIcon sx={{ fontSize: 20 }} />
                RARITY DIST.
              </MUI.ButtonBase>
            </MUI.Box>

            {/* Chart Content Area */}
            <MUI.Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              {activeChart === 'rating' ? (
                <RatingDistributionChart stats={stats} />
              ) : (
                <RarityDistributionChart stats={stats} />
              )}
            </MUI.Box>
          </MUI.Box>
        </MUI.Stack>
      </MUI.Stack>
    </MUI.Box>
  );
};

export default ChampionSkinStatsSection;
