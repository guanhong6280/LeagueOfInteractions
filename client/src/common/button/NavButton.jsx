import React from 'react';
import * as MUI from '@mui/material';
import { Link } from 'react-router-dom';

const NavButton = (props) => {
  return (
    <MUI.Button
      color={props.buttonColor}
      variant={props.buttonVariant}
      component={props.pageLocation ? Link : 'button'}
      to={props.pageLocation || undefined}
      sx={{
        'marginY': '10px',
        'cursor': 'pointer',
        '&:hover': {
          color: props.hoverColor,
        },
      }}
    >
      <MUI.Typography fontSize="15px" fontWeight="600">{props.buttonText}</MUI.Typography>
    </MUI.Button>
  );
};

export default NavButton;
