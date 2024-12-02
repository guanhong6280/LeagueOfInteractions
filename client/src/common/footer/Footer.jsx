import React from 'react'
import * as MUI from "@mui/material";
import Logo from '../Logo';
import NavButton from "../button/NavButton";
import SocialMediaBar from './SocialMediaBar';

const Footer = () => {
  return (
    <MUI.Stack spacing="20px" bgcolor="black" alignItems="center">
      <MUI.Box width="100%" height="65px" display="flex" justifyContent="center" gap="20px" bgcolor="fourth.main">
        <NavButton buttonColor="primary" buttonVariant="text" hoverColor="third.main" buttonText="ABOUT"/>
        <NavButton buttonColor="primary" buttonVariant="text" hoverColor="third.main" buttonText="CONTACT"/>
      </MUI.Box>
      <SocialMediaBar/>
      <Logo/>
      <MUI.Box component="span" sx={{color:"fourth"}}>
        © 2024-Present LeagueInteractions. LeagueInteractions is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
        </MUI.Box>
      <MUI.Box display="flex">
        <MUI.Box></MUI.Box>
        <MUI.Stack></MUI.Stack>
      </MUI.Box>
    </MUI.Stack>
  )
}

export default Footer