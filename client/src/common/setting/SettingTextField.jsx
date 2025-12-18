import React from 'react';
import * as MUI from '@mui/material';

const SettingTextField = ({ label, value, onChange, required, id, type }) => {
  return (
    <MUI.TextField
      required={required}
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: 'white',
          borderRadius: '0px',
          fontWeight: '600',
          '& fieldset': {
            borderColor: 'black',
            borderWidth: '3px',
          },
          '&:hover fieldset': {
            borderColor: 'black',
            borderWidth: '3px',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'black',
            borderWidth: '3px',
          },
          '&.Mui-focused': {
            boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)',
            transform: 'translate(-1px, -1px)',
          },
          transition: 'all 0.1s ease',
        },
        '& .MuiInputLabel-root': {
          color: 'black',
          fontWeight: 'bold',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: 'black',
          fontWeight: 'bold',
        },
      }}
    />
  );
};

export default SettingTextField;
