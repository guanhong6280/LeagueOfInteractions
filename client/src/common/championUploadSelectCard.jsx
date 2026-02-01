import React from 'react';
import * as MUI from '@mui/material';
import { useVersion } from '../contextProvider/VersionProvider.jsx';
import { constructImageUrl } from '../utils/imageUtils';
import theme from '../theme/theme';

// Exporting this so the parent can use it for API payloads too
export const AbilityMap = {
  0: 'P', 1: 'Q', 2: 'W', 3: 'E', 4: 'R',
};

const ChampionUploadSelectCard = ({
  champion,       
  isLoading,      
  championNames,  
  selectedName,   
  abilities,
  selectedAbility,
  onChampionSelect,
  onAbilitySelect,
  themeColor,
  label,
}) => {
  const { version } = useVersion();
  const isRed = themeColor === 'red';
  const mainColor = isRed ? theme.palette.button.redSide : theme.palette.button.blueSide;
  const borderColor = '#000';

  // Helper 1: Champion Image
  const getChampionUrl = () => {
    if (!champion?.id || !version) return null;
    return constructImageUrl(version, 'champion', `${champion.id}.png`);
  };

  // Helper 2: Ability Image
  const getAbilityUrl = (ability, index) => {
    if (!version || !ability?.image) return null;
    const type = index === 0 ? 'passive' : 'spell';
    return constructImageUrl(version, type, ability.image);
  };

  return (
    <MUI.Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      flex={1}
      gap="20px"
      sx={{
        border: `4px solid ${borderColor}`,
        backgroundColor: isRed ? theme.palette.background.redSide : theme.palette.background.blueSide,
        padding: '30px',
        boxShadow: `4px 4px 0px 0px ${borderColor}`,
        position: 'relative',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: `4px 4px 0px 0px ${borderColor}`,
        }
      }}
    >
      {/* Label Badge */}
      <MUI.Typography
        variant="h5"
        fontWeight="900"
        textTransform="uppercase"
        sx={{
          backgroundColor: mainColor,
          color: 'white',
          padding: '5px 20px',
          border: `3px solid ${borderColor}`,
          boxShadow: `2px 2px 0px 0px ${borderColor}`,
          marginBottom: '10px'
        }}
      >
        {label}
      </MUI.Typography>

      {/* Champion Select Dropdown */}
      <MUI.FormControl sx={{ width: '100%', maxWidth: '300px' }}>
        <MUI.Select
          value={selectedName || ''}
          onChange={onChampionSelect}
          displayEmpty
          sx={{
            borderRadius: '0px',
            border: `2px solid ${borderColor}`,
            fontWeight: 'bold',
            backgroundColor: 'white',
            '& .MuiSelect-select': { padding: '10px 15px' },
            '& fieldset': { border: 'none' },
            boxShadow: `2px 2px 0px 0px ${borderColor}`,
          }}
          renderValue={(selected) => {
            if (!selected) return <MUI.Typography color="text.secondary" fontWeight="bold">SELECT CHAMPION</MUI.Typography>;
            return selected;
          }}
        >
          {championNames.map((name) => (
            <MUI.MenuItem key={name} value={name}>{name}</MUI.MenuItem>
          ))}
        </MUI.Select>
      </MUI.FormControl>

      {/* Avatar Display */}
      <MUI.Box
        sx={{
          width: '200px',
          height: '200px',
          backgroundColor: '#e0e0e0',
          border: `1px solid ${borderColor}`,
          backgroundImage: getChampionUrl() ? `url(${getChampionUrl()})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: `2px 2px 0px 0px ${borderColor}`,
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {isLoading && <MUI.CircularProgress sx={{ color: 'black' }} />}
      </MUI.Box>

      {/* Ability Grid */}
      <MUI.Stack direction="row" spacing={2}>
        {abilities.map((ability, index) => {
          const imageUrl = getAbilityUrl(ability, index);
          const isSelected = ability.name === selectedAbility;

          return (
            <MUI.Tooltip key={index} title={`${AbilityMap[index]}: ${ability.name}`} arrow>
              <MUI.Box
                onClick={() => onAbilitySelect({ target: { value: ability.name } })}
                sx={{
                  width: '50px',
                  height: '50px',
                  border: `3px solid ${borderColor}`,
                  backgroundColor: '#ccc',
                  backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.5,
                  transform: isSelected ? 'scale(1.1) translate(-2px, -2px)' : 'none',
                  boxShadow: isSelected ? `4px 4px 0px 0px ${mainColor}` : `2px 2px 0px 0px ${borderColor}`,
                  transition: 'all 0.1s ease',
                  '&:hover': {
                    opacity: 1,
                    transform: 'translate(-2px, -2px)',
                    boxShadow: `4px 4px 0px 0px ${mainColor}`,
                  }
                }}
              />
            </MUI.Tooltip>
          );
        })}
        
        {/* Placeholders */}
        {(!champion || abilities.length === 0) && Array(5).fill(0).map((_, i) => (
          <MUI.Box
            key={i}
            sx={{
              width: '50px',
              height: '50px',
              border: `3px solid ${borderColor}`,
              backgroundColor: 'rgba(0,0,0,0.05)',
            }}
          />
        ))}
      </MUI.Stack>
    </MUI.Box>
  );
};

export default ChampionUploadSelectCard;