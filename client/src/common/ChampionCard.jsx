import React from 'react'
import * as MUI from "@mui/material";

const ChampionCard = (props) => {
  return (
    <MUI.Stack
      alignItems="center"
    >
      <MUI.Box
        width="64px"
        height="64px"
        sx={{
          backgroundImage: props.ChampionImageURL
            ? `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/spell/${spells[1].image.full})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
      </MUI.Box>
      <MUI.Typography>{props.name}</MUI.Typography>
    </MUI.Stack>
  )
}

export default ChampionCard