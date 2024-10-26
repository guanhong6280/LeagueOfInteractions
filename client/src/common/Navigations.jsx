import React from 'react'
import * as MUI from "@mui/material";
import SignIn from './SignIn';
import { Link } from 'react-router-dom';
import navIcon from "../assets/moba.svg";

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
      <MUI.Button 
      color="primary" 
      startIcon={<img src={navIcon} width="24px" height="24px"/>} 
      variant="text" 
      component={Link} 
      to="/" 
      sx={{cursor: "pointer", marginLeft: "20px"}}>
        Champion Interactions
        {/* <MUI.Typography>
          Champion Interactions
        </MUI.Typography> */}
      </MUI.Button>
      <SignIn/>
    </MUI.Box>
  )
}

export default Navigations