import React from 'react'
import * as MUI from "@mui/material";
import axios from "axios";
import { ClassNames } from '@emotion/react';
import { AbilityMap } from '../pages/AddInteractions';

const ChampionSelectCard = (props) => {

  return (
    <MUI.Stack
      border="solid 2px"
      borderRadius="5px"
      spacing="5px"
      paddingX="20px"
      paddingY="50px"
      sx={{
        position: 'relative',
        padding: 4,
        height: "60vh",
        aspectRatio: 2 / 5,
        zIndex: 1, // Ensure content is above the background
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: props.champion
            ? `url(https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${props.champion?.id}_0.jpg)`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3, // Adjust opacity here
          zIndex: -1, // Ensure the background is behind the content
        },
      }}
    >
      <MUI.FormControl>
        <MUI.InputLabel id="champion-select-label">{`Select ${props.order} Champion`}</MUI.InputLabel>
        <MUI.Select
          labelId="champion-select-label"
          value={props.champion?.id || ""}
          label={`Select ${props.order} Champion`}
          onChange={props.handleChampionSelect}
        >
          {props.championNames.map((name, index) => (
            <MUI.MenuItem key={index} value={name}>
              {name}
            </MUI.MenuItem>
          ))}
        </MUI.Select>
      </MUI.FormControl>
      <MUI.Stack
        alignItems="center"
      >
        {props.abilities?.map((ability, index) => {
          const imageUrl =
            index === 0
              ? `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/passive/${props.abilities[index]?.image})`
              : `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/spell/${props.abilities[index]?.image})`;

          return (
            <MUI.Box
              key={index}
              width="64px"
              height="64px"
              onClick={() => props.handleAbilitySelect(ability.name)}
              sx={{
                backgroundImage: props.abilities ? imageUrl : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: ability.name === props.selectedAbility ? 1 : 0.3,
                cursor: "pointer"
              }}
            >
              {AbilityMap[index]}
            </MUI.Box>
          );
        })}
      </MUI.Stack>
    </MUI.Stack>
  )
}

export default ChampionSelectCard