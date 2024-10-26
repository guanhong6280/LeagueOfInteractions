import React from 'react'
import * as MUI from "@mui/material";

import ChampionSelectCard from '../common/ChampionSelectCard'

const ViewInteractions = () => {
  return (
    <div>
      <MUI.Box
        display="flex"
        gap="10px"
        marginTop="50px"
        justifyContent="center"
      >
        <ChampionSelectCard></ChampionSelectCard>
        <MUI.Box
          width="60vw"
          border="solid 2px"
          borderRadius="5px"
        ></MUI.Box>
        <ChampionSelectCard></ChampionSelectCard>
      </MUI.Box>
    </div>
  )
}

export default ViewInteractions