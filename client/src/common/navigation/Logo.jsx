import React from 'react';
import * as MUI from '@mui/material';
import { Link } from 'react-router-dom';
import navIcon from '../../assets/moba.svg';

const Logo = ({ marginLeft = true }) => {
  return (
    <MUI.Box display="flex" alignItems="center" marginLeft={marginLeft ? "20px" : "0px"}>
      <MUI.Icon sx={{ width: '40px', height: '40px', marginRight: '2px' }}>
        <img src={navIcon} width="40px" height="40px" style={{ filter: 'invert(53%) sepia(93%) saturate(3087%) hue-rotate(174deg) brightness(101%) contrast(101%)' }} />
      </MUI.Icon>
      <MUI.Button
        color="primary"
        variant="text"
        component={Link}
        to="/"
        sx={{
          cursor: 'pointer',
          textTransform: 'uppercase',
          padding: 0,
          '&:hover': {
            backgroundColor: 'transparent',
            transform: 'translate(-1px, -1px)',
          }
        }}
      >
        <MUI.Stack spacing={-0.5} alignItems="flex-start">
          <MUI.Typography
            color="black"
            fontWeight="900"
            fontSize="1.2rem"
            sx={{
              lineHeight: 1,
              letterSpacing: '-1px',
              textShadow: '2px 2px 0px #ccc'
            }}
          >
            CHAMPION
          </MUI.Typography>
          <MUI.Typography
            color="black"
            fontWeight="900"
            fontSize="1.2rem"
            sx={{
              lineHeight: 1,
              letterSpacing: '-1px',
              backgroundColor: '#FFDE00',
              paddingX: '2px',
              border: '2px solid black',
              boxShadow: '3px 3px 0px black'
            }}
          >
            INTERACTIONS
          </MUI.Typography>
        </MUI.Stack>
      </MUI.Button>
    </MUI.Box>
  );
};

export default Logo;
