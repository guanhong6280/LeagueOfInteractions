import React from 'react'
import * as MUI from "@mui/material";
import SignIn from './SignIn';
import Logo from './Logo';

const Navigation = () => {
  return (
    <MUI.Box
      display="flex"
      width="100vw"
      height="75px"
      alignItems="center"
      bgcolor="black"
      gap="5px"
      borderBottom="2px solid"
      borderColor="third.main"
      position="sticky"
      top="0"
      zIndex={2}
    >
      <Logo/>
      <SignIn />
    </MUI.Box>
  )
}

export default Navigation