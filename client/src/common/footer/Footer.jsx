import React from 'react';
import * as MUI from '@mui/material';
import Logo from '../navigation/Logo.jsx';
import SocialMediaBar from './SocialMediaBar.jsx';
import { Link } from 'react-router-dom';

const Footer = () => {
  const FooterLink = ({ text, to }) => (
    <MUI.Button
      component={to ? Link : 'button'}
      to={to}
      variant="text"
      sx={{
        color: 'black',
        fontWeight: 900,
        fontSize: '1rem',
        textTransform: 'uppercase',
        borderRadius: '0px',
        border: '2px solid transparent',
        '&:hover': {
          backgroundColor: '#FFDE00',
          border: '2px solid black',
          boxShadow: '4px 4px 0px black',
          transform: 'translate(-2px, -2px)',
        },
        transition: 'all 0.2s',
      }}
    >
      {text}
    </MUI.Button>
  );

  return (
    <MUI.Stack
      alignItems="center"
    >
      {/* Top Section: Links */}
      <MUI.Box
        display="flex"
        justifyContent="center"
        gap="30px"
        flexWrap="wrap"
        sx={{
          borderBottom: '3px solid black',
          borderTop: '3px solid black',
          width: '100%',
        }}
      >
        <FooterLink text="About" />
        <FooterLink text="Contact" to="/contact" />
      </MUI.Box>

      {/* Middle Section: Socials & Logo */}
      <MUI.Box
        display="flex"
        flex="1"
        alignItems="center"
        gap="30px"
        paddingX="20px"
        minWidth="1200px"
        marginY="30px"
        justifyContent="space-between"
      >
        <Logo marginLeft={false} />
        <SocialMediaBar />
      </MUI.Box>

      {/* Bottom Section: Disclaimer */}
      <MUI.Box
        backgroundColor="#f0f0f0"
        padding="20px"
        border="2px solid black"
        boxShadow="6px 6px 0px black"
        width="100%"
        maxWidth="1200px"
        marginBottom="50px"
        boxSizing="border-box"
      >
        <MUI.Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold', display: 'block', color: '#555' }}>
          © 2024-Present LeagueInteractions.
        </MUI.Typography>
        <MUI.Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', marginTop: '10px', color: '#505050' }}>
          LeagueInteractions is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
        </MUI.Typography>
      </MUI.Box>
    </MUI.Stack>
  );
};

export default Footer;
