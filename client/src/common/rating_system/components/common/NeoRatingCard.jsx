import React from 'react';
import * as MUI from '@mui/material';
import { NeoCard, NeoSectionTitle } from '../design/NeoComponents';
import theme from '../../../../theme/theme';

const NeoRatingCard = ({
  title = "SUBMIT YOUR RATING",
  fields = [],
  values = {},
  onChange,
  onSubmit,
  submitLabel = "SUBMIT RATING",
  color = "#ffffff",
}) => {
  return (
    <NeoCard bgcolor={color} sx={{ position: 'relative', width: '100%' }}>
      <NeoSectionTitle bgcolor={theme.palette.button.blueSide}>
        {title}
      </NeoSectionTitle>

      <MUI.Box display="flex" flexDirection="column" gap={2}>
        {fields.map((field) => (
          <MUI.Box key={field.id}>
            <MUI.Typography fontWeight="bold">
              {field.label}
            </MUI.Typography>
            {field.component ? (
                field.component
            ) : (
                <MUI.Slider
                value={values[field.id] || 0}
                onChange={(_, val) => onChange(field.id, val)}
                step={field.step || 1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 2, label: '' },
                  { value: 3, label: '' },
                  { value: 4, label: '' },
                  { value: 5, label: '5' },
                  { value: 6, label: '' },
                  { value: 7, label: '' },
                  { value: 8, label: '' },
                  { value: 9, label: '' },
                  { value: 10, label: '10' },
                ]}
                min={field.min || 1}
                max={field.max || 10}
                valueLabelDisplay="auto"
                sx={{
                    color: 'black',
                    height: 8,
                    mb: 1, // Add margin bottom for labels
                    '& .MuiSlider-thumb': {
                    width: 20,
                    height: 20,
                    backgroundColor: 'white',
                    border: '3px solid black',
                    '&:hover, &.Mui-focusVisible': { boxShadow: 'none' },
                    },
                    '& .MuiSlider-track': { border: 'none' },
                    '& .MuiSlider-rail': { opacity: 0.5, backgroundColor: 'black' },
                    '& .MuiSlider-mark': {
                      backgroundColor: 'black',
                      height: 8,
                      width: 2,
                      '&.MuiSlider-markActive': {
                        opacity: 1,
                        backgroundColor: 'white',
                      },
                    },
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      top: 30, // Push labels down slightly
                    },
                    '& .MuiSlider-valueLabel': {
                      backgroundColor: 'white',
                      color: 'black',
                      borderRadius: 0,
                      fontWeight: 900,
                      fontSize: '0.875rem',
                    }
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

