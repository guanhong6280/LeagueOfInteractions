import React from 'react';
import * as MUI from '@mui/material';

const AccountSettingBox = ({ title, description, children }) => {
  return (
    <MUI.Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        maxWidth: '1000px',
        minHeight: '200px',
        bgcolor: 'white',
        border: '4px solid black',
        boxShadow: '8px 8px 0px 0px #000000',
        borderRadius: '0px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: '10px 10px 0px 0px #000000',
        },
      }}
    >
      {/* Left Side - Title Section */}
      <MUI.Stack
        sx={{
          width: { xs: '100%', md: '35%' },
          bgcolor: '#292929',
          padding: '35px',
          color: 'white',
          borderRight: { xs: 'none', md: '4px solid black' },
          borderBottom: { xs: '4px solid black', md: 'none' },
        }}
      >
        <MUI.Typography
          sx={{
            fontSize: '24px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '-0.5px',
            mb: 1,
          }}
        >
          {title}
        </MUI.Typography>
        <MUI.Typography
          sx={{
            fontSize: '13px',
            color: '#b8b8b8',
            lineHeight: '1.5',
          }}
        >
          {description}
        </MUI.Typography>
      </MUI.Stack>

      {/* Right Side - Content */}
      <MUI.Stack
        sx={{
          flex: 1,
          padding: '35px',
          gap: '20px',
          bgcolor: '#f5f5f5',
        }}
      >
        {children}
      </MUI.Stack>
    </MUI.Box>
  );
};

export default AccountSettingBox;
