import React, { useState, useEffect, memo } from 'react';
import * as MUI from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useParams } from 'react-router-dom';
import {
  LocalFireDepartment as FireIcon,
  Psychology as BrainIcon,
  FlashOn as CarryIcon,
  SentimentVeryDissatisfied as AngerIcon,
  Shield as DefenseIcon,
  Groups as TeamIcon,
  Timeline as LaneIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

import { ReturnButton } from '../components/common';
import { useVersion } from '../../../contextProvider/VersionProvider';
import { getChampionSquareAssetUrl } from '../../../utils/championNameUtils';
import { fetchChampionSpecificStats } from '../../../api/championApi'; // Removed unused fetchChampionList
import PlaystyleRadarChart from '../components/stats/PlaystyleRadarChart';
import AIChipsSection from '../components/stats/AIChipsSection';
import ChampionCommentSection from '../components/sections/ChampionCommentSection';

// --- Helper Components from ChampionStatsCard ---
const ChampionImage = memo(({
  imageUrl,
  championName,
  error = null,
  onRetry
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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

const StatCard = memo(({
  icon,
  label,
  value,
  color = 'primary',
  imageSrc = null
}) => {
  return (
    <MUI.Card
      sx={{
        p: 2,
        textAlign: 'center',
        bgcolor: 'white',
        minHeight: 120,
        border: '2px solid black',
        boxShadow: '4px 4px 0px black',
        borderRadius: 0,
        transition: 'all 0.1s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: '6px 6px 0px black',
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <MUI.Box sx={{ mb: 1 }}>
        {imageSrc ? (
          <img src={imageSrc} alt={label} style={{ width: 32, height: 32 }} />
        ) : (
          icon && React.createElement(icon, { sx: { fontSize: 32, color: 'black' } })
        )}
      </MUI.Box>
      <MUI.Typography
        variant="h5"
        fontWeight="900"
        color="black"
        sx={{ mb: 0.5 }}
      >
        {value}
      </MUI.Typography>
      <MUI.Typography
        variant="caption"
        fontWeight="bold"
        color="text.primary"
        textTransform="uppercase"
      >
        {label}
      </MUI.Typography>
    </MUI.Card>
  );
});

// --- Neo-Brutalist Design Components ---

const NeoCard = ({ children, sx = {}, bgcolor = 'white' }) => (
  <MUI.Box
    sx={{
      border: '3px solid #000',
      boxShadow: '8px 8px 0px #000',
      bgcolor: bgcolor,
      p: 3,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translate(-2px, -2px)',
        boxShadow: '10px 10px 0px #000',
      },
      ...sx
    }}
  >
    {children}
  </MUI.Box>
);

const NeoBadge = ({ label, color = '#A5D6A7' }) => (
  <MUI.Box
    component="span"
    sx={{
      display: 'inline-block',
      border: '2px solid #000',
      bgcolor: color,
      px: 2,
      py: 0.5,
      fontWeight: 900,
      textTransform: 'uppercase',
      fontSize: '0.8rem',
        boxShadow: '2px 2px 0px #000',
      mr: 1,
      mb: 1
    }}
  >
    {label}
  </MUI.Box>
);

const StatBar = ({ label, value, color = '#2196F3', icon: Icon }) => (
  <MUI.Box mb={2}>
    <MUI.Box display="flex" alignItems="center" mb={0.5} justifyContent="space-between">
      <MUI.Box display="flex" alignItems="center" gap={1}>
        {Icon && <Icon sx={{ fontSize: 20 }} />}
        <MUI.Typography fontWeight="900" variant="body2" textTransform="uppercase">
          {label}
        </MUI.Typography>
      </MUI.Box>
      <MUI.Typography fontWeight="900" variant="body2">
        {value ? value.toFixed(1) : 'N/A'}
      </MUI.Typography>
    </MUI.Box>
    <MUI.Box
      sx={{
        height: 20,
        width: '100%',
        border: '2px solid #000',
        bgcolor: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <MUI.Box
        sx={{
          height: '100%',
          width: `${(value / 5) * 100}%`,
          bgcolor: color,
          borderRight: '2px solid #000',
          transition: 'width 1s ease-in-out'
        }}
      />
    </MUI.Box>
  </MUI.Box>
);

// --- Main Component ---

const ChampionRatingPage = () => {
  const { championName } = useParams();
  const { version } = useVersion();

  const [championData, setChampionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // User Rating State
  const [userRatings, setUserRatings] = useState({
    fun: 0,
    skill: 0,
    laning: 0,
    teamfight: 0,
    opponentFrustration: 0,
    teammateFrustration: 0
  });
  const [comment, setComment] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const statsResponse = await fetchChampionSpecificStats(championName);
        console.log(statsResponse.data);

        if (statsResponse.success && statsResponse.data) {
          // Construct championData from stats response (now includes static data)
          setChampionData({
            name: championName,
            title: statsResponse.data.title,
            tags: statsResponse.data.roles || statsResponse.data.tags, // Handle both
            stats: statsResponse.data
          });
        }

      } catch (error) {
        console.error("Failed to load champion data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [championName]);

  if (loading) return (
    <MUI.Box display="flex" justifyContent="center" mt={10}>
      <MUI.CircularProgress sx={{ color: 'black' }} size={60} thickness={5} />
    </MUI.Box>
  );

  const stats = championData?.stats?.championRatingStats || {};

  return (
    <MUI.Container maxWidth="lg" sx={{ py: 5 }}>
      <ReturnButton />

      {/* --- HERO SECTION --- */}
      <MUI.Box mb={6}>
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
            {/* Left Stack: Champion Image + Identity + AI Chips */}
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
                  <ChampionImage
                    imageUrl={getChampionSquareAssetUrl(championName, version)}
                    championName={championName}
                  />
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
                      {championData?.title}
                    </MUI.Typography>
                  </MUI.Stack>
                </MUI.Stack>
              </MUI.Box>

              {/* AI Chips Section */}
              <MUI.Box sx={{ border: '2px solid #000', p: 2, bgcolor: 'white', boxShadow: '4px 4px 0px #000' }}>
                <AIChipsSection chips={stats.aiChips || []} />
              </MUI.Box>
            </MUI.Stack>

            {/* Right Stack: Stats Grid + Radar Chart */}
            <MUI.Stack sx={{ flex: 1 }} spacing={3}>
              {/* Top 4 Cards */}
              <MUI.Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 2,
                }}
              >
                {/* Role Card */}
                <StatCard
                  label="Role"
                  value={championData?.tags?.[0] || 'Unknown'}
                  color="primary"
                  imageSrc={`/role${championData?.tags?.[0] || 'Fighter'}.svg`}
                />

                {/* Damage Type Card */}
                <StatCard
                  label="Damage Type"
                  value={championData?.stats?.damageType?.replace('k', '') || 'Adaptive'}
                  color="warning"
                  imageSrc={championData?.stats?.damageType === 'kMagic' ? '/Ability_power_icon.png' : '/Attack_damage_icon.png'}
                />

                {/* Total Ratings */}
                <StatCard
                  icon={FireIcon}
                  label="Total Ratings"
                  value={stats.totalRatings || 0}
                  color="success"
                />

                {/* Total Comments */}
                <StatCard
                  icon={BrainIcon}
                  label="Total Comments"
                  value={stats.totalComments || 0}
                  color="info"
                />
              </MUI.Box>

              {/* Radar Chart */}
              <MUI.Box
                sx={{
                  flex: 1,
                  minHeight: 300,
                  bgcolor: 'white',
                  border: '3px solid #000',
                  boxShadow: '6px 6px 0px #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
            <MUI.Box
                  position="absolute"
                  top={0}
                  left={0}
                  bgcolor="black"
                  color="white"
                  px={2}
                  py={0.5}
                  fontWeight="900"
                  fontSize="0.8rem"
                  sx={{ borderBottomRightRadius: 0 }}
                >
                  OFFICIAL STATS
                </MUI.Box>
                <PlaystyleRadarChart playstyleInfo={championData?.stats?.playstyleInfo || {
                  damage: 2, durability: 1, crowdControl: 2, mobility: 3, utility: 1
                }} />
              </MUI.Box>
            </MUI.Stack>
          </MUI.Stack>
        </MUI.Box>
      </MUI.Box>

      {/* --- PLAYER RATINGS SECTION --- */}
      <Grid container spacing={4}>

        {/* --- LEFT COLUMN: PLAYER RATINGS --- */}
        <Grid size={{ xs: 12, md: 6 }} display="flex">
          <NeoCard bgcolor="#E0F7FA" sx={{ width: '100%' }}>
            <MUI.Typography variant="h5" fontWeight="900" mb={3} sx={{ textDecoration: 'underline', textDecorationThickness: 3 }}>
              PLAYER RATINGS
            </MUI.Typography>

            <StatBar
              icon={FireIcon}
              label="FUN TO PLAY"
              value={stats.avgFun}
              color="#FF4081"
            />
            <StatBar
              icon={BrainIcon}
              label="Difficulty"
              value={stats.avgSkill}
              color="#7C4DFF"
            />
            <StatBar
              icon={TeamIcon}
              label="Ability Synergy"
              value={stats.avgSynergy}
              color="#4CAF50"
            />

            <MUI.Divider sx={{ borderBottomWidth: 3, borderColor: 'black', my: 3 }} />

            <MUI.Box mb={3}>
              <MUI.Typography fontWeight="900" variant="body2" textTransform="uppercase" mb={1}>
                GAMEPLAY PHASE STRENGTH
              </MUI.Typography>
              <StatBar icon={LaneIcon} label="LANING" value={stats.avgLaning} color="#00BCD4" />
              <StatBar icon={TeamIcon} label="TEAMFIGHT" value={stats.avgTeamfight} color="#FF9800" />
            </MUI.Box>

            <MUI.Divider sx={{ borderBottomWidth: 3, borderColor: 'black', my: 3 }} />

            <MUI.Box>
              <MUI.Typography fontWeight="900" variant="body2" textTransform="uppercase" color="error.main">
                FRUSTRATION INDEX
              </MUI.Typography>
              <StatBar
                icon={AngerIcon}
                label="PLAYING AGAINST (OPPRESSIVENESS)"
                value={stats.avgOpponentFrustration}
                color="#F44336"
              />
              <StatBar
                icon={DefenseIcon}
                label="PLAYING WITH (TEAM RELIABILITY)"
                value={stats.avgTeammateFrustration}
                color="#4CAF50"
              />
            </MUI.Box>

          </NeoCard>
        </Grid>

        {/* --- RIGHT COLUMN: CAST VOTE --- */}
        <Grid size={{ xs: 12, md: 6 }} display="flex">
          <NeoCard bgcolor="#FFCCBC" sx={{ position: 'relative', width: '100%' }}>
            <MUI.Box
              position="absolute"
              top={-15}
              right={-10}
              bgcolor="black"
              color="white"
              px={2}
              py={0.5}
              fontWeight="bold"
            >
              YOUR TURN
                </MUI.Box>

            <MUI.Typography
              variant="h5"
              fontWeight="900"
              mb={3}
              sx={{ textDecoration: 'underline', textDecorationThickness: 3 }}>
              SUBMIT YOUR RATING
            </MUI.Typography>

            <MUI.Box display="flex" flexDirection="column" gap={2}>
              {/* Rating Sliders Wrapper */}
              {[
                { id: 'fun', label: 'Fun Level', min: 1, max: 5 },
                { id: 'skill', label: 'Difficulty Level', min: 1, max: 5 },
                { id: 'synergy', label: 'Ability Synergy', min: 1, max: 5 },
                { id: 'laning', label: 'Laning Phase Strength', min: 1, max: 5 },
                { id: 'teamfight', label: 'Teamfight Strength', min: 1, max: 5 },
                { id: 'opponentFrustration', label: 'Opponent Frustration Level', min: 1, max: 5 },
                { id: 'teammateFrustration', label: 'Teammate Frustration Level', min: 1, max: 5 },
              ].map((field) => (
                <MUI.Box key={field.id}>
                  <MUI.Typography fontWeight="bold">
                    {field.label} ({userRatings[field.id] || '0'})
                  </MUI.Typography>
                  <MUI.Slider
                    value={userRatings[field.id]}
                    onChange={(_, val) => setUserRatings(prev => ({ ...prev, [field.id]: val }))}
                    step={1}
                    marks
                    min={1}
                    max={5}
                  sx={{
                      color: 'black',
                      height: 8,
                      '& .MuiSlider-thumb': {
                        width: 20,
                        height: 20,
                        backgroundColor: 'white',
                        border: '3px solid black',
                        '&:hover, &.Mui-focusVisible': { boxShadow: 'none' },
                      },
                      '& .MuiSlider-track': { border: 'none' },
                      '& .MuiSlider-rail': { opacity: 0.5, backgroundColor: 'black' },
                    }}
                  />
                </MUI.Box>
              ))}
              <MUI.Button
                variant="contained"
                sx={{
                  bgcolor: '#FF4081', // Lively pink color
                  color: 'white',
                  borderRadius: 0,
                  border: '3px solid black', // Thicker black border for contrast
                  py: 1.5,
                  fontWeight: 900,
                  fontSize: '1rem',
                  boxShadow: '4px 4px 0px black', // Black shadow matches the border
                  transition: 'all 0.1s',
                  '&:hover': {
                    bgcolor: '#F50057', // Slightly darker pink on hover
                    transform: 'translate(-2px, -2px)',
                    boxShadow: '6px 6px 0px black',
                  },
                  '&:active': {
                    transform: 'translate(0, 0)',
                    boxShadow: 'none',
                  }
                }}
                onClick={() => console.log('Submit', { userRatings, comment })}
              >
                SUBMIT RATING
              </MUI.Button>
            </MUI.Box>
          </NeoCard>
        </Grid>
      </Grid>

      {/* --- BOTTOM: COMMENTS --- */}
      <MUI.Box mt={6}>
        <NeoCard bgcolor="#E1BEE7">
          <ChampionCommentSection championName={championName} />
        </NeoCard>
      </MUI.Box>

    </MUI.Container>
  );
};

export default ChampionRatingPage;