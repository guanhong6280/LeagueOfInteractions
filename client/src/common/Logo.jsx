import React from 'react';
import * as MUI from '@mui/material';
import { Link } from 'react-router-dom';
import navIcon from '../assets/moba.svg';

const Logo = () => {
  return (
    <MUI.Box display="flex" alignItems="center" marginLeft="20px">
      <MUI.Icon sx={{ width: '30px', height: '30px', color: 'black' }}>
        <img src={navIcon} width="30px" height="30px" />
      </MUI.Icon>
      <MUI.Button
        color="primary"
        variant="text"
        component={Link}
        to="/"
        sx={{ cursor: 'pointer' }}
      >
        <MUI.Stack spacing={-0.8}>
          <MUI.Typography color="white" fontWeight="600">Champion</MUI.Typography>
          <MUI.Typography color="white" fontWeight="600">Interactions</MUI.Typography>
        </MUI.Stack>
      </MUI.Button>
    </MUI.Box>
  );
};

export default Logo;
