import React, { memo } from 'react';
import * as MUI from '@mui/material';
import { AutoAwesome as AIIcon } from '@mui/icons-material';

const AIChipsSection = memo(({ chips = [] }) => {
  // Fallback if no chips provided
  const displayChips = chips.length > 0 ? chips : [
    "Burst Damage", "Squishy", "High Mobility", "Skill Shot Reliance", "Snowball"
  ];

  return (
    <MUI.Stack spacing={1} sx={{ mt: 2 }}>
      <MUI.Box display="flex" alignItems="center" gap={1} mb={1}>
        <AIIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
        <MUI.Typography 
            variant="caption" 
            fontWeight="bold" 
            color="secondary.main"
            sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
        >
          Summary Tags
        </MUI.Typography>
      </MUI.Box>
      
      <MUI.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {displayChips.map((chip, index) => (
          <MUI.Chip
            key={index}
            label={chip}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 600,
              borderRadius: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              '&:hover': {
                borderColor: 'secondary.main',
                color: 'secondary.main',
                bgcolor: 'secondary.50'
              }
            }}
          />
        ))}
      </MUI.Box>
    </MUI.Stack>
  );
});

AIChipsSection.displayName = 'AIChipsSection';

export default AIChipsSection;

