import React from 'react';
import * as MUI from '@mui/material';
import MetricCard from './moderation/common/MetricCard';

const AdminSide = () => {
  return (
    <MUI.Box
      display="flex"
      height="100%"
      padding="20px"
      width="15vw"
      overflow="hidden"
      bgcolor="blue"
    >
      <MUI.Stack>
        <MUI.Typography variant="h6">Moderation Notifications</MUI.Typography>
        <MetricCard />
      </MUI.Stack>
    </MUI.Box>
  );
};

export default AdminSide;