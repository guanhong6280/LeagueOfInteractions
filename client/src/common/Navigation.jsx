import React from 'react';
import * as MUI from '@mui/material';
import SignIn from './SignIn';
import Logo from './Logo';

const Navigation = () => {
  return (
    <MUI.Box
      display="flex"
      width="100vw"
      height="80px"
      alignItems="center"
      bgcolor="#fff5f5"
      borderBottom="3px solid black"
      position="sticky"
      top="0"
      zIndex={1000}
      sx={{
        boxShadow: '0px 4px 0px 0px rgba(0,0,0,0.1)',
      }}
    >
      <Logo />
      <SignIn />
    </MUI.Box>
  );
};

export default Navigation;
