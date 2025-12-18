// SelectField.jsx
import React from 'react';
import * as MUI from '@mui/material';

const SelectField = ({ label, value, options, onChange, multiple = false }) => {
  return (
    <MUI.FormControl fullWidth>
      <MUI.InputLabel
        id={`select-label-${label}`}
        sx={{
          color: 'black',
          fontWeight: 'bold',
          '&.Mui-focused': {
            color: 'black',
            fontWeight: 'bold',
          },
        }}
      >
        {label}
      </MUI.InputLabel>
      <MUI.Select
        labelId={`select-label-${label}`}
        value={value}
        label={label}
        onChange={onChange}
        multiple={multiple}
        renderValue={multiple ? (selected) => (
          <MUI.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((val) => (
              <MUI.Chip 
                key={val} 
                label={options.find(opt => opt.value === val)?.label || val} 
                sx={{
                  bgcolor: '#f0f0f0',
                  color: 'black',
                  fontWeight: 'bold',
                  border: '2px solid black',
                  borderRadius: '0px',
                  height: '24px',
                  fontSize: '0.75rem',
                  '& .MuiChip-label': {
                     padding: '0 8px',
                  }
                }}
              />
            ))}
          </MUI.Box>
        ) : undefined}
        sx={{
          bgcolor: 'white',
          borderRadius: '0px',
          fontWeight: '600',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
            borderWidth: '3px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
            borderWidth: '3px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
            borderWidth: '3px',
          },
          '&.Mui-focused': {
            boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)',
            transform: 'translate(-1px, -1px)',
          },
          transition: 'all 0.1s ease',
        }}
      >
        {options.map((option) => (
          <MUI.MenuItem key={option.value} value={option.value}>
            {option.label}
          </MUI.MenuItem>
        ))}
      </MUI.Select>
    </MUI.FormControl>
  );
};

export default SelectField;
