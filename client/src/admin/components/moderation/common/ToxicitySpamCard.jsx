import React, { useMemo } from 'react';
import * as MUI from '@mui/material';

const clampScore = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
};

const ToxicitySpamCard = ({ title, value = 0, thresholds }) => {
  const { label, color } = useMemo(() => {
    const score = clampScore(value);
    const low = thresholds?.low ?? 0.45;
    const mid = thresholds?.mid ?? 0.7;

    if (score <= low) {
      return { label: 'Low', color: 'success' };
    }
    if (score <= mid) {
      return { label: 'Medium', color: 'warning' };
    }
    return { label: 'High', color: 'error' };
  }, [value, thresholds]);

  const displayValue = useMemo(() => clampScore(value) * 100, [value]);

  return (
    <MUI.Stack spacing={1} minWidth={160}>
      <MUI.Box display="flex" gap={1} justifyContent="space-between" alignItems="center">
        <MUI.Typography variant="body2" fontWeight={600}>
          {title}
        </MUI.Typography>
        <MUI.Chip label={label} color={color} variant="outlined" size="small" />
      </MUI.Box>
      <MUI.LinearProgress
        variant="determinate"
        value={displayValue}
        color={color}
        sx={{
          height: 6,
          borderRadius: 999,
          bgcolor: (theme) => theme.palette.grey[800],
        }}
      />
      <MUI.Typography variant="caption" color="text.secondary">
        {(displayValue).toFixed(0)}%
      </MUI.Typography>
    </MUI.Stack>
  );
};

export default ToxicitySpamCard;
