import React from 'react';
import * as MUI from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  LocalFireDepartment as FireIcon,
  Psychology as BrainIcon,
  SentimentVeryDissatisfied as AngerIcon,
  Shield as DefenseIcon,
  Groups as TeamIcon,
  Timeline as LaneIcon,
} from '@mui/icons-material';
import NeoRatingCard from '../common/NeoRatingCard';
import NeoStatsCard from '../common/NeoStatsCard';
import useChampionRatingData from '../../hooks/useChampionRatingData';

const ChampionRatingSection = ({ championId, championStats }) => {
  const {
    values,
    updateRatingValue,
    submitRating,
    isLoading,
    isSubmitting,
    hasExistingRating,
  } = useChampionRatingData(championId);

  if (isLoading) {
    return (
      <MUI.Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <MUI.CircularProgress size={40} />
      </MUI.Box>
    );
  }

  const ratingFields = [
    { id: 'fun', label: 'Fun Level', min: 1, max: 10 },
    { id: 'skill', label: 'Difficulty Level', min: 1, max: 10 },
    { id: 'synergy', label: 'Ability Synergy', min: 1, max: 10 },
    { id: 'laning', label: 'Laning Phase Strength', min: 1, max: 10 },
    { id: 'teamfight', label: 'Teamfight Strength', min: 1, max: 10 },
    { id: 'opponentFrustration', label: 'Opponent Frustration Level', min: 1, max: 10 },
    { id: 'teammateFrustration', label: 'Teammate Frustration Level', min: 1, max: 10 },
  ];

  const statsSections = [
    {
      items: [
        { icon: FireIcon, label: 'FUN TO PLAY', value: championStats?.avgFun, color: '#FF4081' },
        { icon: BrainIcon, label: 'Difficulty', value: championStats?.avgSkill, color: '#7C4DFF' },
        { icon: TeamIcon, label: 'Ability Synergy', value: championStats?.avgSynergy, color: '#4CAF50' },
      ],
    },
    {
      title: 'GAMEPLAY PHASE STRENGTH',
      items: [
        { icon: LaneIcon, label: 'LANING', value: championStats?.avgLaning, color: '#00BCD4' },
        { icon: TeamIcon, label: 'TEAMFIGHT', value: championStats?.avgTeamfight, color: '#FF9800' },
      ],
    },
    {
      title: 'FRUSTRATION INDEX',
      titleColor: 'error.main',
      items: [
        { icon: AngerIcon, label: 'PLAYING AGAINST (OPPRESSIVENESS)', value: championStats?.avgOpponentFrustration, color: '#F44336' },
        { icon: DefenseIcon, label: 'PLAYING WITH (TEAM RELIABILITY)', value: championStats?.avgTeammateFrustration, color: '#4CAF50' },
      ],
    },
  ];

  return (
    <MUI.Box>
      <Grid container spacing={4}>
        {/* Stats Card */}
        <Grid size={{ xs: 12, md: 6 }} display="flex">
          <NeoStatsCard
            title="COMMUNITY RATINGS"
            sections={statsSections}
            color="#E0F7FA"
          />
        </Grid>

        {/* Rating Card */}
        <Grid size={{ xs: 12, md: 6 }} display="flex">
          <NeoRatingCard
            title="SUBMIT YOUR RATING"
            fields={ratingFields}
            values={values}
            onChange={updateRatingValue}
            onSubmit={submitRating}
            submitLabel={isSubmitting ? 'SUBMITTING...' : (hasExistingRating ? 'UPDATE RATING' : 'SUBMIT RATING')}
            color="#FFCCBC"
            badgeText="YOUR TURN"
          />
        </Grid>
      </Grid>
    </MUI.Box>
  );
};

export default ChampionRatingSection;

