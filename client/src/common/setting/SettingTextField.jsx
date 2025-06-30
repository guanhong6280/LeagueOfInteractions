import React from 'react'
import * as MUI from "@mui/material";

const SettingTextField = ({label, value, onChange, required, id, type}) => {
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
          '& fieldset': {
            borderColor: 'white',
          },
          '&:hover fieldset': {
            borderColor: 'white',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'white',
          },
          color: "white",
        },
        '& .MuiInputLabel-root': {
          color: 'white',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: 'white',
        },
      }}
    />
  );
}

export default SettingTextField