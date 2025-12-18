import React from 'react';
import * as MUI from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Settings, Public, Person, Male, Female } from '@mui/icons-material';
import * as Flags from 'country-flag-icons/react/3x2';
import RankBadge from './RankBadge';
import FavoriteChampionsGrid from './FavoriteChampionsGrid';
import FavoriteSkinsGrid from './FavoriteSkinsGrid';

// Reusable Profile Info Button Component
const ProfileInfoButton = ({ children, tooltip, onClick, sx }) => (
  <MUI.Tooltip title={tooltip || ""}>
    <MUI.IconButton
      onClick={onClick}
      disableRipple
      sx={{
        bgcolor: 'white',
        border: '2px solid black',
        borderRadius: '0px',
        boxShadow: '3px 3px 0px 0px #000000',
        padding: '8px',
        '&:hover': {
          bgcolor: '#e0e0e0',
          transform: 'translate(1px, 1px)',
          boxShadow: '2px 2px 0px 0px #000000',
        },
        transition: 'all 0.1s ease',
        ...sx
      }}
    >
      {children}
    </MUI.IconButton>
  </MUI.Tooltip>
);

const ProfileHeroCard = ({ user, isOwnProfile = false }) => {
  const navigate = useNavigate();

  const getCountryFlag = (countryName) => {
    if (!countryName) return <Public sx={{ fontSize: '24px', color: 'black' }} />;
    const code = countryName === 'United States' ? 'US' :
      countryName === 'South Korea' ? 'KR' :
        countryName === 'China' ? 'CN' :
          countryName === 'Canada' ? 'CA' :
            countryName === 'United Kingdom' ? 'GB' :
              countryName === 'Germany' ? 'DE' :
                countryName === 'France' ? 'FR' :
                  'US'; 

    const FlagComponent = Flags[code];
    return FlagComponent ? <FlagComponent title={countryName} style={{ width: '24px', height: '16px' }} /> : <Public sx={{ fontSize: '24px', color: 'black' }} />;
  };

  const getRankIconPath = (rank) => {
    if (!rank) return '/ranks/iron.png'; 
    return `/ranks/${rank.toLowerCase()}.png`;
  };

  const getRoleIconPath = (role) => {
    if (!role) return null;
    return `/Positions/${role.toLowerCase()}.svg`;
  };

  return (
    <MUI.Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: '400px',
        border: '4px solid black',
        boxShadow: '10px 10px 0px 0px #000000',
        marginBottom: '40px',
        bgcolor: 'white',
      }}
    >
      {/* LEFT SECTION - Basic Info */}
      <MUI.Box
        sx={{
          flex: '0 0 350px',
          borderRight: { xs: 'none', md: '4px solid black' },
          borderBottom: { xs: '4px solid black', md: 'none' },
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Edit Profile Button */}
        {isOwnProfile && (
          <ProfileInfoButton
            tooltip="Edit Profile"
            onClick={() => navigate('/settings')}
            sx={{
              position: 'absolute',
              top: '20px',
              right: '20px',
            }}
          >
            <Settings sx={{ color: 'black', fontSize: '20px' }} />
          </ProfileInfoButton>
        )}

        <MUI.Stack>
          {/* Profile Picture & Badges Row */}
          <MUI.Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap="10px"
            marginBottom="20px"
          >
            {/* Avatar */}
            <MUI.Box
              width="154px"
              height="154px"
              border="4px solid black"
              boxShadow="3px 3px 0px 0px #000000"
              bgcolor="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxSizing="border-box"
              sx={{
                backgroundImage: user.profilePictureURL ? `url(${user.profilePictureURL})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!user.profilePictureURL && <Person sx={{ fontSize: '80px', color: '#ccc' }} />}
            </MUI.Box>

            {/* Badges Column */}
            <MUI.Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
              gap="5px"
            >
              {/* Country Flag Button */}
              <ProfileInfoButton tooltip={user.homeCountry || "Unknown Country"}>
                <MUI.Box display="flex" alignItems="center" justifyContent="center" width="28px" height="28px">
                  {getCountryFlag(user.homeCountry)}
                </MUI.Box>
              </ProfileInfoButton>

              {/* Rank Icon Button */}
              <ProfileInfoButton tooltip={user.rank || "Unranked"}>
                <MUI.Box
                  component="img"
                  src={getRankIconPath(user.rank)}
                  alt={user.rank || "rank"}
                  sx={{ width: '28px', height: '28px', objectFit: 'contain' }}
                />
              </ProfileInfoButton>

              {/* Sex Icon Button */}
              <ProfileInfoButton tooltip={user.sex || "Unknown"}>
                <MUI.Box display="flex" alignItems="center" justifyContent="center" width="28px" height="28px">
                  {user.sex === 'Female' ? <Female sx={{ fontSize: '24px', color: 'black' }} /> : <Male sx={{ fontSize: '24px', color: 'black' }} />}
                </MUI.Box>
              </ProfileInfoButton>
            </MUI.Box>
          </MUI.Box>

          {/* Username */}
          <MUI.Typography
            sx={{
              fontSize: '28px',
              fontWeight: '900',
              color: 'black',
              textTransform: 'uppercase',
              textAlign: 'center',
              lineHeight: '1',
              letterSpacing: '-1px',
              marginBottom: '20px',
              wordBreak: 'break-word',
            }}
          >
            {user.username}
          </MUI.Typography>

          {/* Summoner Details Stack */}
          <MUI.Stack spacing={2} alignItems="start">

            {/* Main Roles */}
            <MUI.Box display="flex" alignItems="center" gap="10px">
              <MUI.Typography fontWeight="900" fontSize="14px">ROLES:</MUI.Typography>
              {user.mainRoles && user.mainRoles.length > 0 ? (
                user.mainRoles.map(role => (
                  <ProfileInfoButton key={role} tooltip={role}>
                    <MUI.Box
                      component="img"
                      src={getRoleIconPath(role)}
                      alt={role}
                      sx={{ 
                        width: '24px', 
                        height: '24px', 
                        objectFit: 'contain',
                        filter: 'brightness(0) saturate(100%)' // Forces the SVG to render as pure black
                      }}
                    />
                  </ProfileInfoButton>
                ))
              ) : (
                <MUI.Typography fontSize="14px" fontWeight="bold" color="#000000">N/A</MUI.Typography>
              )}
            </MUI.Box>

            {/* Preferred Game Modes */}
            <MUI.Box display="flex" alignItems="center" gap="10px" flexWrap="wrap" justifyContent="center">
              <MUI.Typography fontWeight="900" fontSize="14px">MODES:</MUI.Typography>
              {user.preferredGameModes && user.preferredGameModes.length > 0 ? (
                user.preferredGameModes.map(mode => (
                  <ProfileInfoButton key={mode} tooltip={mode}>
                    <MUI.Typography fontWeight="800" fontSize="10px" color="#000000" ml={0.5}>{mode}</MUI.Typography>
                  </ProfileInfoButton>
                ))
              ) : (
                <MUI.Typography fontSize="14px" fontWeight="bold" color="#000000">N/A</MUI.Typography>
              )}
            </MUI.Box>

            {/* Year Joined */}
            <MUI.Box display="flex" alignItems="center" gap="10px">
              <MUI.Typography fontWeight="900" fontSize="14px">JOINED:</MUI.Typography>
              {user.timeJoinedTheGame ? (
                <ProfileInfoButton tooltip={`Joined LoL in ${user.timeJoinedTheGame}`}>
                  <MUI.Typography fontWeight="800" fontSize="12px" color="#000000">{user.timeJoinedTheGame}</MUI.Typography>
                </ProfileInfoButton>
              ) : (
                <MUI.Typography fontSize="14px" fontWeight="bold" color="#000000">N/A</MUI.Typography>
              )}
            </MUI.Box>

          </MUI.Stack>
        </MUI.Stack>

      </MUI.Box>

      {/* RIGHT SECTION - Favorites */}
      <MUI.Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Favorite Champions */}
        <MUI.Box
          sx={{
            flex: 1,
            padding: '30px',
            borderBottom: '4px solid black',
            bgcolor: '#ffffff', // Cleaner white background
          }}
        >
          <MUI.Typography
            sx={{
              fontSize: '18px',
              fontWeight: '900',
              textTransform: 'uppercase',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              '&::before': {
                content: '""',
                display: 'block',
                width: '12px',
                height: '12px',
                bgcolor: 'black',
              }
            }}
          >
            Favorite Champions
          </MUI.Typography>
          <FavoriteChampionsGrid champions={user.favoriteChampions} />
        </MUI.Box>

        {/* Favorite Skins */}
        <MUI.Box
          sx={{
            flex: 1,
            padding: '30px',
            bgcolor: '#fafafa', // Slightly different background to distinguish sections
          }}
        >
          <MUI.Typography
            sx={{
              fontSize: '18px',
              fontWeight: '900',
              textTransform: 'uppercase',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              '&::before': {
                content: '""',
                display: 'block',
                width: '12px',
                height: '12px',
                bgcolor: 'black',
              }
            }}
          >
            Favorite Skins
          </MUI.Typography>
          <FavoriteSkinsGrid skins={user.favoriteSkins} />
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
};

export default ProfileHeroCard;
