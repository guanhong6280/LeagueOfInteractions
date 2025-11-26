import React, { memo, Suspense, useState } from 'react';
import * as MUI from '@mui/material';
import { 
  Star as StarIcon,
  Comment as CommentIcon,
  BarChart as BarChartIcon,
  Palette as PaletteIcon,
  TrendingUp as TrendingUpIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  PieChart as PieChartIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import RatingDistributionChart from './RatingDistributionChart';
import RarityDistributionChart from './RarityDistributionChart';

// ============= EXTRACTED COMPONENTS =============

const StatCard = memo(({ 
  icon: IconComponent, 
  label, 
  value, 
  color = 'primary',
  error = null 
}) => {
  if (error) {
    return (
      <MUI.Card
        sx={{
          p: 2,
          textAlign: 'center',
          bgcolor: 'error.50',
          minHeight: 120,
        }}
      >
        <ErrorIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
        <MUI.Typography variant="caption" color="error">
          Error
        </MUI.Typography>
      </MUI.Card>
    );
  }

  return (
    <MUI.Card
      sx={{
        p: 2,
        textAlign: 'center',
        bgcolor: `${color}.50`,
        minHeight: 120,
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          bgcolor: `${color}.100`,
        },
      }}
      role="article"
      aria-label={`${label}: ${value}`}
    >
      <MUI.CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <MUI.Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            color: `${color}.main`,
          }}
        >
          <IconComponent 
            sx={{ 
              fontSize: 32,
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
            }} 
          />
        </MUI.Box>
        <MUI.Typography 
          variant="h5" 
          fontWeight="bold" 
          color={`${color}.dark`}
          sx={{ mb: 0.5 }}
        >
          {value}
        </MUI.Typography>
        <MUI.Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {label}
        </MUI.Typography>
      </MUI.CardContent>
    </MUI.Card>
  );
});

const ChampionImage = memo(({ 
  imageUrl, 
  championName, 
  error = null,
  onRetry 
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleRetry = () => {
    setImageError(false);
    setImageLoaded(false);
    if (onRetry) onRetry();
  };

  return (
    <MUI.Box
      sx={{
        width: 150,
        height: 150,
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        border: '3px solid',
        borderColor: 'primary.200',
        bgcolor: 'grey.50',
        boxShadow: 3,
      }}
    >
      {!imageError && imageUrl ? (
        <>
          <MUI.Avatar
            src={imageUrl}
            alt={`${championName} portrait`}
            variant="square"
            sx={{
              width: '100%',
              height: '100%',
              transition: 'opacity 0.3s ease',
              opacity: imageLoaded ? 1 : 0,
            }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {!imageLoaded && (
            <MUI.Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
              }}
            >
              <MUI.CircularProgress size={24} />
            </MUI.Box>
          )}
        </>
      ) : (
        <MUI.Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            color: 'text.secondary',
          }}
        >
          <ErrorIcon sx={{ fontSize: 32, mb: 1 }} />
          <MUI.Typography variant="caption" textAlign="center">
            Image failed
          </MUI.Typography>
          {onRetry && (
            <MUI.IconButton size="small" onClick={handleRetry} sx={{ mt: 0.5 }}>
              <RefreshIcon fontSize="small" />
            </MUI.IconButton>
          )}
        </MUI.Box>
      )}
    </MUI.Box>
  );
});

const PopularSkinsSection = memo(({ 
  mostPopularSkin, 
  highestRatedSkin 
}) => {

  return (
    <MUI.Stack 
      spacing={2}
      sx={{
        p: 3,
        bgcolor: 'grey.50',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    > 
      <MUI.Stack spacing={2}>
        <MUI.Box>
          <MUI.Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ mb: 0.5, fontWeight: 500 }}
          >
            Most Popular
          </MUI.Typography>
          <MUI.Typography 
            variant="body1" 
            fontWeight="bold"
            color="primary.main"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={mostPopularSkin?.name || 'No data available'}
          >
            {mostPopularSkin?.name || '—'}
          </MUI.Typography>
        </MUI.Box>
        
        <MUI.Box>
          <MUI.Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ mb: 0.5, fontWeight: 500 }}
          >
            Highest Rated
          </MUI.Typography>
          <MUI.Stack direction="row" alignItems="center" spacing={1}>
            <MUI.Typography 
              variant="body1" 
              fontWeight="bold"
              color="warning.main"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
              title={highestRatedSkin?.name || 'No data available'}
            >
              {highestRatedSkin?.name || '—'}
            </MUI.Typography>
            {highestRatedSkin && (
              <MUI.Chip
                icon={<StarIcon />}
                label={`${highestRatedSkin.averageRating.toFixed(1)}`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </MUI.Stack>
        </MUI.Box>
      </MUI.Stack>
    </MUI.Stack>
  );
});

// ============= MAIN COMPONENT =============
const ChampionStatsCard = memo(({ 
  championImageUrl,
  championName,
  championTitle,
  stats, 
  error = null,
  onRetry,
  onNavigateToRating,
  onNavigateToComments 
}) => {
  const [activeChart, setActiveChart] = useState('rating');

  // Safe data access with fallbacks
  const formatNumber = (num) => num?.toLocaleString() ?? '—';
  const safeStats = {
    totalSkins: stats?.totalSkins ?? 0,
    averageRating: stats?.averageRating ?? 0,
    totalRatings: stats?.totalRatings ?? 0,
    totalComments: stats?.totalComments ?? 0,
    mostPopularSkin: stats?.mostPopularSkin,
    highestRatedSkin: stats?.highestRatedSkin,
  };

  if (error) {
    return (
      <MUI.Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          mb: 4,
          p: 4,
          bgcolor: 'error.50',
          border: '2px solid',
          borderColor: 'error.200',
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
        <MUI.Typography variant="h6" color="error" gutterBottom>
          Failed to load champion statistics
        </MUI.Typography>
        <MUI.Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </MUI.Typography>
        {onRetry && (
          <MUI.Button 
            variant="contained" 
            color="error" 
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Retry
          </MUI.Button>
        )}
      </MUI.Box>
    );
  }

  return (
    <MUI.Box
      component="section"
      role="region"
      aria-label="Champion statistics"
      padding="10px"
      sx={{
        maxWidth: 980,
        mx: 'auto',
        mb: 4,
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
            {/* Layout: Left Stack (Image + Popular Skins) | Right Stack (Stats Grid + Graph Area) */}
      <MUI.Stack
        direction="row"
        spacing={3}
        sx={{ minHeight: 400 }}
      >
        {/* Left Stack: Champion Image + Popular Skins */}
        <MUI.Stack spacing={3} sx={{ minWidth: 300 }}>
          {/* Champion Image and Name Section */}
          <MUI.Stack direction="row" spacing={2} alignItems="center">
            {/* Champion Image */}
            <ChampionImage
              imageUrl={championImageUrl}
              championName={championName}
              error={error}
              onRetry={onRetry}
            />
            
            {/* Champion Name and Title Stack */}
            <MUI.Stack spacing={1}>
              <MUI.Typography 
                variant="h4" 
                fontWeight="bold"
                color="primary.main"
                sx={{ lineHeight: 1.2 }}
              >
                {championName || 'Loading...'}
              </MUI.Typography>
              
              {championTitle && (
                <MUI.Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ 
                    fontStyle: 'italic',
                    lineHeight: 1.3,
                  }}
                >
                  {championTitle}
                </MUI.Typography>
              )}
            </MUI.Stack>
          </MUI.Stack>

          {/* Popular Skins Section */}
          <PopularSkinsSection
            mostPopularSkin={safeStats.mostPopularSkin}
            highestRatedSkin={safeStats.highestRatedSkin}
          />

          {/* Action Buttons */}
          <MUI.Stack spacing={2}>
            <MUI.Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<StarIcon />}
              onClick={onNavigateToRating}
              sx={{
                py: 1.5,
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Rate {championName || 'Champion'}'s Skins
            </MUI.Button>
            
            <MUI.Button
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<CommentIcon />}
              onClick={onNavigateToComments}
              sx={{
                py: 1.5,
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Comment {championName || 'Champion'}'s Skins
            </MUI.Button>
          </MUI.Stack>
        </MUI.Stack>

        {/* Right Stack: Stats Grid + Graph Area */}
        <MUI.Stack sx={{ flex: 1 }} spacing={3}>
          {/* Stats Grid */}
          <MUI.Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 2,
            }}
            role="group"
            aria-label="Champion statistics"
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
              value={formatNumber(safeStats.totalRatings)}
              color="success"
            />
            <StatCard
              icon={CommentIcon}
              label="Total Comments"
              value={formatNumber(safeStats.totalComments)}
              color="info"
            />
          </MUI.Box>

          {/* Charts Area */}
          <MUI.Box
            sx={{
              flex: 1,
              minHeight: 300,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Chart Navigation */}
            <MUI.Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <MUI.ButtonGroup variant="outlined" size="small" fullWidth>
                <MUI.Button
                  variant={activeChart === 'rating' ? 'contained' : 'outlined'}
                  startIcon={<PieChartIcon />}
                  onClick={() => setActiveChart('rating')}
                  sx={{ textTransform: 'none' }}
                >
                  Rating Distribution
                </MUI.Button>
                <MUI.Button
                  variant={activeChart === 'rarity' ? 'contained' : 'outlined'}
                  startIcon={<AssessmentIcon />}
                  onClick={() => setActiveChart('rarity')}
                  sx={{ textTransform: 'none' }}
                >
                  Rarity Distribution
                </MUI.Button>
              </MUI.ButtonGroup>
            </MUI.Box>

            {/* Chart Content */}
            <MUI.Box sx={{ flex: 1, p: 2 }}>
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
});

// Set display names for debugging
StatCard.displayName = 'StatCard';
ChampionImage.displayName = 'ChampionImage';
PopularSkinsSection.displayName = 'PopularSkinsSection';
ChampionStatsCard.displayName = 'ChampionStatsCard';

export default ChampionStatsCard; 