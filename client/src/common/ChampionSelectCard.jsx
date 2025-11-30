import React from 'react';
import * as MUI from '@mui/material';
import { Favorite, FavoriteBorder, Close } from '@mui/icons-material';
import { useVersion } from '../contextProvider/VersionProvider';
import { constructImageUrl } from '../utils/imageUtils';

const ChampionSelectCard = (props) => {
  const { version, loading: versionLoading } = useVersion();
  const [isFavorite, setIsFavorite] = React.useState(false);

  // Determine theme based on order
  const isRed = props.order === 'First'; // 'First' champion is Red (Left), 'Second' is Blue (Right)
  const mainColor = isRed ? '#ff4d4d' : '#4d79ff'; // Neo-brutalist red/blue
  const bgColor = isRed ? '#fff5f5' : '#f0f4ff'; // Light tint background

  // Construct image URLs with proper versioning
  const getAbilityImageUrl = (ability, index) => {
    if (!version || !ability?.image) return null;

    const imageType = index === 0 ? 'passive' : 'spell';
    return constructImageUrl(version, imageType, ability.image);
  };

  const getChampionProfileUrl = () => {
    if (!props.champion?.id || !version) return null;
    return constructImageUrl(version, 'champion', `${props.champion.id}.png`);
  };

  const handleClearSelection = () => {
    props.handleChampionSelect({ target: { value: '' } });
  };

  return (
    <MUI.Card
      sx={{
        width: '280px', // Fixed Width
        minWidth: '280px', // Prevents shrinking
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '0px',
        border: '3px solid black',
        boxShadow: '8px 8px 0px 0px #000000',
        backgroundColor: bgColor, // Use tinted background
        overflow: 'visible',
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        padding: '20px',
      }}
    >
      {/* 1. TOP BAR: Dropdown + Clear Button */}
      <MUI.Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        <MUI.FormControl fullWidth size="small">
          <MUI.Select
            value={props.champion?.id || ''}
            onChange={props.handleChampionSelect}
            displayEmpty
            sx={{
              borderRadius: '0px',
              border: '2px solid black',
              fontWeight: 'bold',
              backgroundColor: 'white',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '&:hover': { backgroundColor: '#fff' }, // Keep white on hover for contrast
              boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.2)',
              textTransform: 'uppercase',
              height: '45px',
              fontSize: '1rem',
            }}
            renderValue={(selected) => {
              if (!selected) {
                return <MUI.Typography sx={{ color: 'gray', fontWeight: 'bold', fontSize: '1rem' }}>SELECT {props.order}</MUI.Typography>;
              }
              return selected;
            }}
          >
            {props.championNames.map((name, index) => (
              <MUI.MenuItem key={index} value={name} sx={{ fontWeight: 'bold' }}>
                {name}
              </MUI.MenuItem>
            ))}
          </MUI.Select>
        </MUI.FormControl>

        <MUI.IconButton
          onClick={handleClearSelection}
          disabled={!props.champion}
          sx={{
            border: '2px solid black',
            borderRadius: '0px',
            padding: '5px',
            backgroundColor: 'white',
            color: 'black',
            boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.2)',
            '&:hover': {
              backgroundColor: isRed ? '#ffcdd2' : '#bbdefb', // Hover color matches theme
              transform: 'translate(1px, 1px)',
              boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.2)',
            },
            '&:disabled': {
              backgroundColor: 'transparent',
              borderColor: '#ccc',
              color: '#ccc',
              boxShadow: 'none',
            },
            transition: 'all 0.1s ease',
            height: '45px',
            width: '45px',
          }}
        >
          <Close />
        </MUI.IconButton>
      </MUI.Box>

      {/* 2. MAIN COLUMN: Image (with Absolute Button) -> Vertical Abilities */}
      <MUI.Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Champion Square Profile Picture + Absolute Favorite Button */}
        <MUI.Box
          sx={{
            position: 'relative',
            width: '180px',
            height: '180px',
            flexShrink: 0,
          }}
        >
          <MUI.Box
            sx={{
              width: '100%',
              height: '100%',
              backgroundColor: 'white', // Keep image background white/neutral
              border: '3px solid black',
              backgroundImage: getChampionProfileUrl() ? `url(${getChampionProfileUrl()})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '6px 6px 0px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
          </MUI.Box>

          {/* Absolute Favorite Button (Icon Only) */}
          {props.champion && (
            <MUI.IconButton
              onClick={() => setIsFavorite(!isFavorite)}
              disableRipple
              sx={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                padding: 0,
                color: isFavorite ? mainColor : 'white', // Use Main Color (Red/Blue) for heart
                filter: 'drop-shadow(2px 2px 0px #000)',
                zIndex: 10,
                '&:hover': {
                  backgroundColor: 'transparent',
                  transform: 'scale(1.2)',
                },
                transition: 'all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
            >
              {isFavorite ? (
                <Favorite sx={{ fontSize: '32px' }} />
              ) : (
                <FavoriteBorder sx={{ fontSize: '32px', color: 'white' }} />
              )}
            </MUI.IconButton>
          )}
        </MUI.Box>

        {/* Vertical Abilities Stack */}
        <MUI.Box
          sx={{
            width: '100%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            marginTop: '10px',
            minHeight: '250px',
          }}
        >
          {props.abilities?.map((ability, index) => {
            const imageUrl = getAbilityImageUrl(ability, index);
            const isSelected = ability.name === props.selectedAbility;
            const borderColor = '#000000';

            return (
              <MUI.Box
                onClick={() => props.handleAbilitySelect(ability.name)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '240px',
                  padding: '8px 12px',
                  transition: 'all 0.1s ease',
                  border: '2px solid black',
                  backgroundColor: isSelected ? mainColor : 'white', // Use Main Color when selected
                  boxShadow: isSelected
                    ? '4px 4px 0px 0px #000000'
                    : '2px 2px 0px 0px rgba(0,0,0,0.1)',
                  transform: isSelected ? 'translate(-2px, -2px)' : 'none',
                  '&:hover': {
                    backgroundColor: isSelected ? mainColor : (isRed ? '#ffebee' : '#e3f2fd'), // Light hover tint
                    transform: 'translate(-2px, -2px)',
                    boxShadow: '4px 4px 0px 0px #000000',
                  },
                  marginBottom: '8px',
                }}
              >
                {/* Icon */}
                <MUI.Box
                  sx={{
                    width: '36px',
                    height: '36px',
                    border: `2px solid ${borderColor}`,
                    backgroundColor: '#ccc',
                    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0,
                    filter: isSelected ? 'none' : 'grayscale(100%)',
                  }}
                >
                  {versionLoading && (
                    <MUI.CircularProgress size={15} sx={{ color: 'black', position: 'absolute', top: '25%', left: '25%' }} />
                  )}
                </MUI.Box>

                {/* Text Container */}
                <MUI.Box sx={{ overflow: 'hidden', flex: 1 }}>
                  <MUI.Stack direction="row" alignItems="center" spacing={1.5}>
                    {/* Key Badge */}
                    <MUI.Typography
                      sx={{
                        fontWeight: '900',
                        fontSize: '0.9rem',
                        color: isSelected ? mainColor : 'white', // Text matches main color
                        backgroundColor: 'black',
                        padding: '2px 8px',
                        border: '1px solid black',
                        borderRadius: '0px',
                        minWidth: '28px',
                        textAlign: 'center',
                      }}
                    >
                      {index === 0 ? 'P' : ['Q', 'W', 'E', 'R'][index - 1]}
                    </MUI.Typography>

                    {/* Name */}
                    <MUI.Typography
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        color: isSelected ? 'white' : 'black', // White text on colored bg
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {ability.name}
                    </MUI.Typography>
                  </MUI.Stack>
                </MUI.Box>
              </MUI.Box>
            );
          })}

          {/* Placeholders */}
          {!props.champion && Array(5).fill(0).map((_, i) => (
            <MUI.Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                maxWidth: '240px',
                padding: '8px 12px',
                border: '2px solid rgba(0,0,0,0.1)',
                marginBottom: '8px',
              }}
            >
              <MUI.Box sx={{ width: '36px', height: '36px', border: '2px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.5)' }} />
              <MUI.Box sx={{ height: '20px', width: '100px', backgroundColor: 'rgba(255,255,255,0.5)' }} />
            </MUI.Box>
          ))}
        </MUI.Box>
      </MUI.Box>
    </MUI.Card>
  );
};

export default ChampionSelectCard;
