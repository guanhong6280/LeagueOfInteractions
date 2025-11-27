import React from 'react';
import * as MUI from '@mui/material';
import { NeoCard } from '../design/NeoComponents';

const NeoRatingCard = ({
  title = "SUBMIT YOUR RATING",
  fields = [],
  values = {},
  onChange,
  onSubmit,
  submitLabel = "SUBMIT RATING",
  color = "#FFCCBC",
  badgeText = "YOUR TURN"
}) => {
  return (
    <NeoCard bgcolor={color} sx={{ position: 'relative', width: '100%' }}>
      {badgeText && (
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
          {badgeText}
        </MUI.Box>
      )}

      <MUI.Typography
        variant="h5"
        fontWeight="900"
        mb={3}
        sx={{ textDecoration: 'underline', textDecorationThickness: 3 }}>
        {title}
      </MUI.Typography>

      <MUI.Box display="flex" flexDirection="column" gap={2}>
        {fields.map((field) => (
          <MUI.Box key={field.id}>
            <MUI.Typography fontWeight="bold">
              {field.label} ({values[field.id] || (field.min || 0)})
            </MUI.Typography>
            {field.component ? (
                field.component
            ) : (
                <MUI.Slider
                value={values[field.id] || 0}
                onChange={(_, val) => onChange(field.id, val)}
                step={field.step || 1}
                marks={field.marks}
                min={field.min || 1}
                max={field.max || 5}
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
            )}
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
            },
            '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#9e9e9e',
                border: '3px solid #9e9e9e',
                boxShadow: 'none'
            }
          }}
          onClick={onSubmit}
        >
          {submitLabel}
        </MUI.Button>
      </MUI.Box>
    </NeoCard>
  );
};

export default NeoRatingCard;

