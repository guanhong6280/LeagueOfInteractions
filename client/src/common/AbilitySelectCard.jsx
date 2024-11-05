import React from 'react'
import * as MUI from "@mui/material";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { AbilityMap } from '../pages/AddInteractions';

const AbilitySelectCard = (props) => {
  
  return (
    <MUI.Box
      display="flex"
      bgcolor={props.bgColor}
      borderRadius="10px"
      alignItems="center"
      paddingY="20px">
      <MUI.Box
        width="100px"
        height="100px"
        border="3px solid #B87333"
        borderRadius="10px"
        marginLeft="50px"
        sx={{
          backgroundImage: props.champion
            ? `url(https://ddragon.leagueoflegends.com/cdn/14.19.1/img/champion/${props.champion?.id}.png)`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></MUI.Box>
      <ArrowRightAltIcon sx={{ fontSize: '100px', color: 'red', marginX: '20px' }} />
      <MUI.Box flex="1" display="flex" gap="20px">
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
              border="3px solid #B87333"
              borderRadius="10px"
              sx={{
                backgroundImage: props.abilities ? imageUrl : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: ability.name === props.selectedAbility ? 1 : 0.3,
              }}
            ></MUI.Box>
          );
        })}
      </MUI.Box>
      <MUI.Stack marginRight="50px" spacing="20px">
        <MUI.FormControl sx={{ width: "200px" }}>
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
        <MUI.FormControl sx={{ width: "200px" }}>
          <MUI.InputLabel id="champion-ability-select-label">{`${props.order} Champion Ability`}</MUI.InputLabel>
          <MUI.Select
            labelId="champion-ability-select-label"
            value={props.selectedAbility || ""}
            label={`${props.order} Champion Ability`}
            onChange={props.handleAbilitySelect}
          >
            {props.abilities?.map((spell, index) => (
              <MUI.MenuItem key={index} value={spell.name}>
                {`${AbilityMap[index]}: ${spell.name}`}
              </MUI.MenuItem>
            ))}
          </MUI.Select>
        </MUI.FormControl>
      </MUI.Stack>
    </MUI.Box>
  )
}

export default AbilitySelectCard