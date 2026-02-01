import React from 'react';
import * as MUI from '@mui/material';
import SignIn from './SignIn.jsx';
import Logo from './Logo.jsx';
import theme from '../../theme/theme';

const Navigation = () => {
  return (
    <MUI.Box
      display="flex"
      width="100%"
      height="80px"
      alignItems="center"
      bgcolor={theme.palette.background.redSide_light}
      borderBottom="3px solid black"
      position="sticky"
      top="0"
      zIndex={1000}
      overflow="hidden"
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
