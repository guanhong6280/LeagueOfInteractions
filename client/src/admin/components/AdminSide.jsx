import React from 'react';
import * as MUI from '@mui/material';
import MetricCard from './moderation/common/MetricCard';
import useCommentModerationSummary from '../hooks/useCommentModerationSummary';
import useVideoModerationSummary from '../hooks/useVideoModerationSummary';

const cardHelper = {
  champion: 'Champion comments flagged for review',
  skin: 'Skin comments pending moderation',
  video: 'Videos waiting for approval',
};

const AdminSide = () => {
  const championSummary = useCommentModerationSummary('champion');
  const skinSummary = useCommentModerationSummary('skin');
  const videoSummary = useVideoModerationSummary();

  const cards = [
    {
      key: 'champion',
      label: 'Champion Comments',
      value: championSummary.pending ?? 0,
      loading: championSummary.isLoading || championSummary.isFetching,
      helper: cardHelper.champion,
    },
    {
      key: 'skin',
      label: 'Skin Comments',
      value: skinSummary.pending ?? 0,
      loading: skinSummary.isLoading || skinSummary.isFetching,
      helper: cardHelper.skin,
    },
    {
      key: 'video',
      label: 'Videos',
      value: videoSummary.pending ?? 0,
      loading: videoSummary.isLoading || videoSummary.isFetching,
      helper: cardHelper.video,
    },
  ];

  return (
    <MUI.Box
      component="aside"
      width="20vw"
      minWidth="240px"
      bgcolor="background.side_panel"
      display="flex"
      flexDirection="column"
      gap={3}
      padding="20px"
    >
      <MUI.Stack spacing={1}>
        <MUI.Typography variant="h6" color="#000000">
          Notifications
        </MUI.Typography>
      </MUI.Stack>

      <MUI.Stack spacing={2}>
        {cards.map(({ key, label, value, loading }) => (
          <MetricCard
            key={key}
            label={label}
            value={value}
            loading={loading}
            accentColor="#878787"
          />
        ))}
      </MUI.Stack>

      <MUI.Box
        component="section"
        bgcolor="#ffffff"
        border={`1px solid #878787`}
        borderRadius={2}
        padding={2}
        display="flex"
        flexDirection="column"
        gap={1}
        mt="auto"
      >
        <MUI.Typography variant="subtitle2" color="#000000" sx={{ letterSpacing: 0.4 }}>
          Quick Actions
        </MUI.Typography>
        <MUI.Typography variant="body2" color="#878787">
          Manual maintenance tools live here. Sync skin data or reset queues as needed.
        </MUI.Typography>
        <MUI.Button
          variant="outlined"
          color="inherit"
          disabled
          sx={{
            borderColor: '#878787',
            color: '#000000',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Sync Skin Database (coming soon)
        </MUI.Button>
      </MUI.Box>
    </MUI.Box>
  );
};

export default AdminSide;