import React from 'react';
import * as MUI from '@mui/material';
import { AbilityMap } from '../pages/AddInteractions';
import { useVersion } from '../contextProvider/VersionProvider';
import { constructImageUrl, constructChampionLoadingUrl } from '../utils/imageUtils';

const ChampionSelectCard = (props) => {
  const { version, loading: versionLoading } = useVersion();

  // Construct image URLs with proper versioning
  const getAbilityImageUrl = (ability, index) => {
    if (!version || !ability?.image) return null;
    
    const imageType = index === 0 ? 'passive' : 'spell';
    return constructImageUrl(version, imageType, ability.image);
  };

  const getChampionLoadingUrl = () => {
    if (!props.champion?.id) return null;
    return constructChampionLoadingUrl(props.champion.id);
  };

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
          backgroundImage: getChampionLoadingUrl() ? `url(${getChampionLoadingUrl()})` : 'none',
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
            const imageUrl = getAbilityImageUrl(ability, index);

            return (
              <MUI.Stack
                key={index}
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
                  width="64px"
                  height="64px"
                  onClick={() => props.handleAbilitySelect(ability.name)}
                  sx={{
                    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    // Add fallback styling if image fails to load
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Show loading indicator if version is still loading */}
                  {versionLoading && (
                    <MUI.Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                    >
                      <MUI.CircularProgress size={20} />
                    </MUI.Box>
                  )}
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
