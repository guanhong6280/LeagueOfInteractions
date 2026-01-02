import React from 'react';
import * as MUI from '@mui/material';
import { useParams } from 'react-router-dom';

import { ReturnButton } from '../components/common';
import { useVersion } from '../../../contextProvider/VersionProvider';
import { getChampionSquareAssetUrl } from '../../../utils/championNameUtils';
import { useRatingSectionData } from '../../../hooks/useRatingSectionData'; // Reusable Hook
import PlaystyleRadarChart from '../components/stats/PlaystyleRadarChart';
import AIChipsSection from '../components/stats/AIChipsSection';
import ChampionCommentSection from '../components/sections/ChampionCommentSection';
import { NeoCard, StatCard, ChampionImage } from '../components/design/NeoComponents';
import ChampionRatingSection from '../components/sections/ChampionRatingSection';

import { LocalFireDepartment as FireIcon, Psychology as BrainIcon } from '@mui/icons-material';

// --- Main Component ---

const ChampionRatingPage = () => {
  const { id } = useParams();
  const { version } = useVersion();

  // Use the reusable hook, requesting only rating stats
  const { data: statsData } = useRatingSectionData(id, { include: 'champions' });


  const championData = React.useMemo(() => {
    if (!statsData) return null;
    return {
      name: statsData.championName, // The unified "Name"
      title: statsData.title,
      roles: statsData.roles,
      stats: statsData // The raw stats if needed
    };
  }, [statsData]);

  const championName = championData?.name || '';
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
                  value={championData?.roles?.[0] || 'Unknown'}
                  color="primary"
                  imageSrc={`/role${(championData?.roles?.[0] || 'Fighter').replace(/^\w/, c => c.toUpperCase())}.svg`}
                />

                {/* Damage Type Card */}
                <StatCard
                  label="Damage Type"
                  value={championData?.stats?.damageType?.replace('k', '') === 'Magic' ? 'AP' : 'AD' || 'Adaptive'}
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
      <ChampionRatingSection
        championName={championName}
        championStats={stats}
        championId={id}
      />

      {/* --- BOTTOM: COMMENTS --- */}
      <MUI.Box mt={6}>
        <NeoCard bgcolor="#E1BEE7">
          <ChampionCommentSection championId={id} />
        </NeoCard>
      </MUI.Box>

    </MUI.Container>
  );
};

export default ChampionRatingPage;
