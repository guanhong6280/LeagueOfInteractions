import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as MUI from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const ReturnButton = ({ 
  onClick, 
  customText = "Back",
  showIcon = true,
  color = "primary",
  size = "medium"
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
        top: { xs: 8, sm: 30 },
        left: { xs: 8, sm: 16 },
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <MUI.Button
        onClick={handleClick}
        variant="contained"
        color={color}
        size={size}
        startIcon={showIcon ? <ArrowBackIcon /> : undefined}
        sx={{
          borderRadius: '20px',
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
          minWidth: 'auto',
          px: 2,
          py: 1,
        }}
      >
        {customText}
      </MUI.Button>
    </MUI.Box>
  );
};

export default ReturnButton; 