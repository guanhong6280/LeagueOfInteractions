// SelectField.jsx
import React from 'react';
import * as MUI from "@mui/material";

const SelectField = ({ label, value, options, onChange }) => {
  return (
    <MUI.FormControl fullWidth>
      <MUI.InputLabel
        sx={{
          color: 'white',
          '&.Mui-focused': {
            color: 'white',
          },
        }}
      >
        {label}
      </MUI.InputLabel>
      <MUI.Select
        value={value}
        label={label}
        onChange={onChange}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
          color: 'white', // text color inside select
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