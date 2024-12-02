import React from 'react';
import * as MUI from "@mui/material";
import YouTubeIcon from '@mui/icons-material/YouTube';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';

const socialMediaLinks = [
  { name: "youtube", url: "https://www.youtube.com", component: YouTubeIcon },
  { name: "X", url: "https://www.x.com", component: XIcon },
  { name: "instagram", url: "https://www.instagram.com", component: InstagramIcon }
];

const SocialMediaBar = () => {
  return (
    <MUI.Box display="flex" alignItems="center" gap="20px">
      {socialMediaLinks.map((link, index) => {
        const IconComponent = link.component;
        return (
          <MUI.Link
            key={index}
            href={link.url}
            target="_blank"
            sx={{ color: "white", cursor: "pointer" }}
          >
            <IconComponent />
          </MUI.Link>
        );
      })}
    </MUI.Box>
  );
};

export default SocialMediaBar;