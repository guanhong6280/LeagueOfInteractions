import React from 'react'
import * as MUI from "@mui/material";
import SignIn from './SignIn';

const Navigations = () => {
  return (
    <MUI.Box
      display="flex"
      width="100vw"
      height="75px"
      alignItems="center"
      sx={{
        backgroundImage: `url(https://cmsassets.rgpub.io/sanity/images/dsfx7636/universe/f81004a39c5502d766169beb4a342c46b0030d36-1920x946.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
      }}      
    >
      <MUI.Typography marginLeft="20px">Champion Interactions</MUI.Typography>
      <SignIn/>
    </MUI.Box>
  )
}

export default Navigations