import React from 'react'
import * as MUI from '@mui/material';

const MetricCard = () => {
  return (
    <MUI.Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="10px"
      padding="20px"
      borderRadius="10px"
      border="1px solid #e0e0e0"
    >
      <MUI.Avatar>24</MUI.Avatar>
      <MUI.Typography variant="h6">Pending Comments</MUI.Typography>
    </MUI.Box>
  )
}

export default MetricCard