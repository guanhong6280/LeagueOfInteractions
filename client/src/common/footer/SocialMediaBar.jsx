import React from 'react';
import * as MUI from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';

const socialMediaLinks = [
  { name: 'youtube', url: 'https://www.youtube.com', component: YouTubeIcon },
  { name: 'X', url: 'https://www.x.com', component: XIcon },
  { name: 'instagram', url: 'https://www.instagram.com', component: InstagramIcon },
];

const SocialMediaBar = () => {
  return (
    <MUI.Box display="flex" alignItems="center" gap="15px">
      {socialMediaLinks.map((link, index) => {
        const IconComponent = link.component;
        return (
          <MUI.Link
            key={index}
            aria-label={`Visit ${link.name} page`}
            href={link.url}
            target="_blank"
            sx={{ 
              color: 'black', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              border: '2px solid black',
              borderRadius: '0px',
              backgroundColor: 'white',
              boxShadow: '3px 3px 0px black',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: '#FFDE00',
                transform: 'translate(-2px, -2px)',
                boxShadow: '5px 5px 0px black',
              }
            }}
          >
            <IconComponent sx={{ fontSize: '20px' }} />
          </MUI.Link>
        );
      })}
    </MUI.Box>
  );
};

export default SocialMediaBar;
