import React from 'react';
import * as MUI from '@mui/material';

const MetricCard = ({
  label = 'Metric',
  value = 0,
  loading = false,
  accentColor = '#878787',
}) => {
  return (
    <MUI.Box
      component="article"
      bgcolor="#000000"
      color="#ffffff"
      borderRadius={2}
      border={`1px solid ${accentColor}`}
      padding={1.5}
      width="100%"
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight={60}
    >
      <MUI.Typography
        variant="subtitle2"
        fontWeight={600}
        sx={{ 
          letterSpacing: 0.5, 
          color: '#ffffff', 
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          textAlign: 'center'
        }}
      >
        {label}
      </MUI.Typography>

      {/* Bubble Badge */}
      <MUI.Box
        position="absolute"
        top={-8}
        right={-8}
        bgcolor="#ffffff"
        color="#000000"
        minWidth={24}
        height={24}
        borderRadius="12px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        paddingX={0.8}
        sx={{
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}
      >
        {loading ? (
          <MUI.CircularProgress size={10} color="inherit" thickness={6} />
        ) : (
          value
        )}
      </MUI.Box>
    </MUI.Box>
  );
};

export default MetricCard;
