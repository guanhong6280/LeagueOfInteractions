import React from 'react';
import * as MUI from '@mui/material';
import { AbilityMap } from '../pages/AddInteractions';

const ChampionSelectCard = (props) => {
  return (
    <MUI.Stack
      border="solid 3px"
      borderColor="#785A28"
      borderRadius="10px"
      spacing="5px"
      height="100%"
      boxShadow="5"
      sx={{
        'position': 'relative',
        'aspectRatio': 2 / 5,
        'zIndex': 1, // Ensure content is above the background
        'backgroundColor': 'white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: props.champion ?
            `url(https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${props.champion?.id}_0.jpg)` :
            'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
          zIndex: -1,
        },
      }}
    >
      <MUI.Stack gap="20px">
        <MUI.FormControl sx={{ marginX: '10px', marginTop: '20px' }}>
          <MUI.InputLabel id="champion-select-label">{`Select ${props.order} Champion`}</MUI.InputLabel>
          <MUI.Select
            labelId="champion-select-label"
            value={props.champion?.id || ''}
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
          spacing="10px"
        >
          {props.abilities?.map((ability, index) => {
            const imageUrl =
              index === 0 ?
                `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/passive/${props.abilities[index]?.image})` :
                `url(https://ddragon.leagueoflegends.com/cdn/14.13.1/img/spell/${props.abilities[index]?.image})`;

            return (
              <MUI.Stack
                alignItems="center"
                sx={{
                  'opacity': ability.name === props.selectedAbility ? 1 : 0.5,
                  'transition': 'transform 0.5s ease', // Slows down the transition to 0.5 seconds
                  '&:hover': {
                    transform: ability.name === props.selectedAbility ? 'none' : 'scale(1.1)',
                  },
                }}
              >
                <MUI.Box
                  key={index}
                  width="64px"
                  height="64px"
                  onClick={() => props.handleAbilitySelect(ability.name)}
                  sx={{
                    backgroundImage: props.abilities ? imageUrl : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                  }}
                >
                </MUI.Box>
                <MUI.Typography>
                  {ability.name}
                </MUI.Typography>
              </MUI.Stack>
            );
          })}
        </MUI.Stack>
      </MUI.Stack>
    </MUI.Stack>
  );
};

export default ChampionSelectCard;
