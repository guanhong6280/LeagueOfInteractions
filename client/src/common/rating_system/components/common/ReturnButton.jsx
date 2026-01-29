import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as MUI from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const ReturnButton = ({
  onClick,
  customText = "Back",
  showIcon = true,
  color = "primary",
  size = "small",
  top = { xs: 8, sm: 30 },
  left = { xs: 8, sm: 16 },
  containerSx,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <MUI.Box
      sx={{
        position: 'fixed',
        top,
        left,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        ...(containerSx || {}),
      }}
    >
      <MUI.Button
        onClick={handleClick}
        variant="contained"
        color={color}
        size={size}
        startIcon={showIcon ? <ArrowBackIcon /> : undefined}
        sx={{
          bgcolor: 'white',
          color: 'black',
          borderRadius: 0,
          border: '3px solid black',
          boxShadow: '4px 4px 0px black',
          fontWeight: 900,
          textTransform: 'uppercase',
          '&:hover': {
            bgcolor: '#f0f0f0',
            boxShadow: '6px 6px 0px black',
            transform: 'translate(-2px, -2px)',
          },
          '&:active': {
            boxShadow: 'none',
            transform: 'translate(0, 0)',
          },
          transition: 'all 0.1s ease-in-out',
          minWidth: 'auto',
          px: 3,
          py: 1,
        }}
      >
        {customText}
      </MUI.Button>
    </MUI.Box>
  );
};

export default ReturnButton; 