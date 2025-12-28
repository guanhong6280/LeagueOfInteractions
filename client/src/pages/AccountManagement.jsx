import React, { useState, useEffect, useRef } from 'react';
import * as MUI from '@mui/material';
import { 
  Logout, 
  Save, 
  DeleteForever,
  Person,
  Face,
  SportsEsports,
  Security,
  VideogameAsset,
  Cancel
} from '@mui/icons-material';

import AccountSettingBox from '../common/setting/AccountSettingBox';
import SettingTextField from '../common/setting/SettingTextField';
import SelectField from '../common/setting/SelectField';
import { 
  sexOptions, 
  rankOptions, 
  yearJoinedOptions, 
  popularCountries,
  roleOptions,
  gameModeOptions
} from '../common/setting/settingConstants';

// Hooks
import useAccountManagement from '../hooks/useAccountManagement';
import useCurrentUser from '../hooks/useCurrentUser';
import useLogout from '../hooks/useLogout';
import { useChampionNames } from '../hooks/useChampionNames'; // ✅ Replaced Context
import { useToast } from '../toast/useToast'; // ✅ Added Toast

const AccountManagement = () => {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { mutateAsync: logout } = useLogout();
  const { mutateAsync: updateAccountInformation, isPending: isSaving } = useAccountManagement();
  const { data: championNames = [] } = useChampionNames(); // ✅ React Query
  const { success, error, info } = useToast();
  
  // Refs for scrolling
  const summonerSettingsRef = useRef(null);
  const personalInfoRef = useRef(null);
  const profileCustomRef = useRef(null);
  const riotAccountsRef = useRef(null);
  const accountActionsRef = useRef(null);

  // 1. Summoner Settings
  const [rank, setRank] = useState('');
  const [yearJoined, setYearJoined] = useState('');
  const [mainRoles, setMainRoles] = useState([]);
  const [preferredGameModes, setPreferredGameModes] = useState([]);
  const [favoriteChampions, setFavoriteChampions] = useState([]);
  const [favoriteSkins, setFavoriteSkins] = useState([]); 
  const [initialSummonerData, setInitialSummonerData] = useState(null);

  // 2. Personal Info (Read Only)
  const [email, setEmail] = useState('');
  
  // 3. Profile Customization
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [homeCountry, setHomeCountry] = useState('');
  const [profilePictureURL, setProfilePictureURL] = useState('');
  const [initialProfileData, setInitialProfileData] = useState(null);

  // 4. Riot Accounts
  const [riotAccounts, setRiotAccounts] = useState([]);

  // Sync state with User Data on load
  useEffect(() => {
    if (user) {
      // 1. Summoner
      setRank(user.rank || '');
      setYearJoined(user.timeJoinedTheGame || '');
      setMainRoles(user.mainRoles || []);
      setPreferredGameModes(user.preferredGameModes || []);
      setFavoriteChampions(user.favoriteChampions || []);
      setFavoriteSkins(user.favoriteSkins || []);
      
      setInitialSummonerData({
        rank: user.rank || '',
        yearJoined: user.timeJoinedTheGame || '',
        mainRoles: user.mainRoles || [],
        preferredGameModes: user.preferredGameModes || [],
        favoriteChampions: user.favoriteChampions || [],
        favoriteSkins: user.favoriteSkins || [],
      });

      // 2. Personal
      setEmail(user.email || '');

      // 3. Profile
      setUsername(user.username || '');
      setAge(user.age || '');
      setSex(user.sex || '');
      setHomeCountry(user.homeCountry || '');
      setProfilePictureURL(user.profilePictureURL || '');

      setInitialProfileData({
        username: user.username || '',
        age: user.age || '',
        sex: user.sex || '',
        homeCountry: user.homeCountry || '',
        profilePictureURL: user.profilePictureURL || '',
      });

      // 4. Riot
      setRiotAccounts(user.riotAccounts || []);
    }
  }, [user]);

  // --- Change Detection Logic ---
  const isSummonerFormChanged = () => {
    if (!initialSummonerData) return false;
    return (
      rank !== initialSummonerData.rank ||
      yearJoined !== initialSummonerData.yearJoined ||
      JSON.stringify(mainRoles) !== JSON.stringify(initialSummonerData.mainRoles) ||
      JSON.stringify(preferredGameModes) !== JSON.stringify(initialSummonerData.preferredGameModes) ||
      JSON.stringify(favoriteChampions) !== JSON.stringify(initialSummonerData.favoriteChampions)
    );
  };

  const isProfileFormChanged = () => {
    if (!initialProfileData) return false;
    return (
      username !== initialProfileData.username ||
      age !== initialProfileData.age ||
      sex !== initialProfileData.sex ||
      homeCountry !== initialProfileData.homeCountry ||
      profilePictureURL !== initialProfileData.profilePictureURL
    );
  };

  // --- Handlers ---

  const handleSaveSummonerSettings = async () => {
    try {
      const updatedData = {
        rank,
        timeJoinedTheGame: yearJoined,
        mainRoles,
        preferredGameModes,
        favoriteChampions,
        favoriteSkins
      };

      await updateAccountInformation(updatedData);
      
      // Update initial data to match new state (reset "changed" status)
      setInitialSummonerData({
        rank,
        yearJoined,
        mainRoles,
        preferredGameModes,
        favoriteChampions,
        favoriteSkins
      });
      
      success('Summoner settings updated successfully!');
    } catch (err) {
      console.error('Error updating settings:', err);
      error(err.message || 'Failed to update settings');
    }
  };

  const handleSaveProfileCustomization = async () => {
    try {
      const updatedData = {
        username,
        age,
        sex,
        homeCountry,
        profilePictureURL,
      };

      await updateAccountInformation(updatedData);
      setInitialProfileData(updatedData);
      success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      error(err.message || 'Failed to update profile');
    }
  };

  const handleAddChampion = (championName) => {
    if (favoriteChampions.length < 5 && !favoriteChampions.includes(championName)) {
      setFavoriteChampions([...favoriteChampions, championName]);
    } else if (favoriteChampions.length >= 5) {
      info('You can only select up to 5 favorite champions.');
    }
  };

  const handleRemoveChampion = (championName) => {
    setFavoriteChampions(favoriteChampions.filter(c => c !== championName));
  };

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully');
    } catch (err) {
      error('Failed to log out');
    }
  };

  const scrollToSection = (ref) => {
    if (ref.current) {
      const yOffset = -100; 
      const element = ref.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // --- Render ---

  if (isUserLoading) {
    return (
      <MUI.Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MUI.CircularProgress size={60} sx={{ color: 'black' }} />
      </MUI.Box>
    );
  }

  if (!user) {
    return (
      <MUI.Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <MUI.Box sx={{ bgcolor: 'white', border: '4px solid black', boxShadow: '8px 8px 0px 0px #000000', p: 4, textAlign: 'center' }}>
          <MUI.Typography fontSize="24px" fontWeight="900" mb={1}>
            Please sign in
          </MUI.Typography>
          <MUI.Typography color="#666">
            You need to be logged in to manage your account settings.
          </MUI.Typography>
        </MUI.Box>
      </MUI.Box>
    );
  }

  const menuItems = [
    { label: 'Summoner Settings', icon: <VideogameAsset />, ref: summonerSettingsRef },
    { label: 'Personal Information', icon: <Person />, ref: personalInfoRef },
    { label: 'Profile Customization', icon: <Face />, ref: profileCustomRef },
    { label: 'Riot Accounts', icon: <SportsEsports />, ref: riotAccountsRef },
    { label: 'Account Actions', icon: <Security />, ref: accountActionsRef },
  ];

  return (
    <MUI.Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        paddingY: '100px',
        paddingX: '20px',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* Sidebar - Fixed Position on Desktop */}
      <MUI.Box
        sx={{
          position: { xs: 'relative', md: 'fixed' },
          top: { xs: 'auto', md: '120px' },
          left: { xs: 'auto', md: '60px' },
          width: { xs: '100%', md: '280px' },
          zIndex: 10,
          mb: { xs: 4, md: 0 },
        }}
      >
        <MUI.Typography
          sx={{
            fontSize: '36px',
            fontWeight: '900',
            color: 'black',
            textTransform: 'uppercase',
            lineHeight: '1.1',
            letterSpacing: '-2px',
            textShadow: '4px 4px 0px rgba(255,255,255,0.3)',
            marginLeft: '24px',
            marginBottom: '20px',
          }}
        >
          Account
          <br />
          Settings
        </MUI.Typography>

        <MUI.List component="nav" sx={{ p: 0 }}>
          {menuItems.map((item) => (
            <MUI.ListItemButton
              key={item.label}
              onClick={() => scrollToSection(item.ref)}
              sx={{
                mb: 1.5,
                border: '2px solid transparent',
                borderRadius: '0px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  border: '2px solid black',
                  boxShadow: '4px 4px 0px 0px #000000',
                  transform: 'translate(-2px, -2px)',
                  bgcolor: 'white',
                },
              }}
            >
              <MUI.ListItemIcon sx={{ color: 'black', minWidth: '40px' }}>
                {item.icon}
              </MUI.ListItemIcon>
              <MUI.ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: 800, 
                  textTransform: 'uppercase',
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                }} 
              />
            </MUI.ListItemButton>
          ))}
        </MUI.List>
      </MUI.Box>

      {/* Main Content Area */}
      <MUI.Stack
        sx={{
          marginLeft: { xs: '0', md: '350px' },
          marginRight: { xs: '0', md: '50px' },
          spacing: '30px',
          gap: '30px',
          flex: 1,
          maxWidth: '1000px',
        }}
      >
        {/* 1. Summoner Settings */}
        <MUI.Box ref={summonerSettingsRef}>
          <AccountSettingBox
            title="Summoner Settings"
            description="Manage your League of Legends identity and preferences"
          >
            <MUI.Box display="flex" gap="20px" flexWrap="wrap">
              <MUI.Box flex="1" minWidth="200px">
                <SelectField
                  label="Rank"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  options={rankOptions}
                />
              </MUI.Box>
              <MUI.Box flex="1" minWidth="200px">
                <SelectField
                  label="Year Joined LoL"
                  value={yearJoined}
                  onChange={(e) => setYearJoined(e.target.value)}
                  options={yearJoinedOptions}
                />
              </MUI.Box>
            </MUI.Box>

            <MUI.Box display="flex" gap="20px" flexWrap="wrap">
              <MUI.Box flex="1" minWidth="200px">
                <SelectField
                  label="Main Roles (Max 2)"
                  value={mainRoles}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 2) setMainRoles(typeof val === 'string' ? val.split(',') : val);
                  }}
                  options={roleOptions}
                  multiple={true}
                />
              </MUI.Box>
              <MUI.Box flex="1" minWidth="200px">
                <SelectField
                  label="Preferred Game Modes (Max 2)"
                  value={preferredGameModes}
                  onChange={(e) => {
                     const val = e.target.value;
                     if (val.length <= 2) setPreferredGameModes(typeof val === 'string' ? val.split(',') : val);
                  }}
                  options={gameModeOptions}
                  multiple={true}
                />
              </MUI.Box>
            </MUI.Box>

            {/* Favorite Champions */}
            <MUI.Box>
              <MUI.Typography fontWeight="bold" mb={1} sx={{ color: '#555' }}>
                Favorite Champions (Max 5)
              </MUI.Typography>
              
              <MUI.Box display="flex" gap="10px" flexWrap="wrap" mb={2}>
                {favoriteChampions.map((champion) => (
                  <MUI.Chip
                    key={champion}
                    label={champion}
                    onDelete={() => handleRemoveChampion(champion)}
                    deleteIcon={<Cancel />}
                    sx={{
                      bgcolor: 'white',
                      color: 'black',
                      fontWeight: 'bold',
                      border: '2px solid black',
                      borderRadius: '0px',
                      boxShadow: '2px 2px 0px 0px #000000',
                      '& .MuiChip-deleteIcon': {
                        color: '#ff4d4d',
                        '&:hover': { color: '#ff0000' },
                      },
                    }}
                  />
                ))}
              </MUI.Box>

              {favoriteChampions.length < 5 && (
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel sx={{ color: 'black', '&.Mui-focused': { color: 'black' } }}>
                    Add Champion
                  </MUI.InputLabel>
                  <MUI.Select
                    value=""
                    onChange={(e) => handleAddChampion(e.target.value)}
                    label="Add Champion"
                    sx={{
                      bgcolor: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black', borderWidth: '2px' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                    }}
                  >
                    {championNames
                      .filter(name => !favoriteChampions.includes(name))
                      .map((name) => (
                        <MUI.MenuItem key={name} value={name}>
                          {name}
                        </MUI.MenuItem>
                      ))}
                  </MUI.Select>
                </MUI.FormControl>
              )}
            </MUI.Box>

            <MUI.Box>
              <MUI.Typography fontWeight="bold" mb={1} sx={{ color: '#555' }}>
                Favorite Skins (Coming Soon)
              </MUI.Typography>
              <MUI.Typography fontSize="12px" color="#666" fontStyle="italic">
                Skin selection will be available in a future update.
              </MUI.Typography>
            </MUI.Box>
          
            {/* Save Button */}
            <MUI.Button
              variant="contained"
              onClick={handleSaveSummonerSettings}
              disabled={!isSummonerFormChanged() || isSaving}
              startIcon={isSaving ? <MUI.CircularProgress size={20} color="inherit"/> : <Save />}
              sx={{
                bgcolor: '#0AC8B9',
                color: 'white',
                fontWeight: '900',
                fontSize: '14px',
                padding: '12px 30px',
                border: '3px solid black',
                borderRadius: '0px',
                boxShadow: '5px 5px 0px 0px #000000',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                alignSelf: 'flex-start',
                '&:hover': {
                  bgcolor: '#09b0a3',
                  transform: 'translate(2px, 2px)',
                  boxShadow: '3px 3px 0px 0px #000000',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#999',
                  border: '3px solid #ccc',
                  boxShadow: 'none',
                  cursor: 'not-allowed'
                },
                transition: 'all 0.1s ease',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </MUI.Button>
          </AccountSettingBox>
        </MUI.Box>

        {/* 2. Personal Information */}
        <MUI.Box ref={personalInfoRef}>
          <AccountSettingBox
            title="Personal Information"
            description="Manage your account security (Read Only)"
          >
            <SettingTextField
              label="Email Address"
              value={email}
              disabled={true}
              id="email-input"
              type="email"
            />
            <SettingTextField
              label="Password"
              value="********"
              disabled={true}
              id="password-input"
              type="password"
            />
             <MUI.Typography fontSize="12px" color="#666" fontStyle="italic">
                Password change functionality is currently disabled.
              </MUI.Typography>
          </AccountSettingBox>
        </MUI.Box>

        {/* 3. Profile Customization */}
        <MUI.Box ref={profileCustomRef}>
          <AccountSettingBox
            title="Profile Customization"
            description="Customize your public profile appearance"
          >
             <SettingTextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={true}
              id="username-input"
              type="text"
            />
            
            <MUI.Box display="flex" gap="20px" flexWrap="wrap">
              <MUI.Box flex="1" minWidth="200px">
                <SettingTextField
                  label="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  id="age-input"
                  type="number"
                />
              </MUI.Box>
              <MUI.Box flex="1" minWidth="200px">
                <SelectField
                  label="Sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  options={sexOptions}
                />
              </MUI.Box>
            </MUI.Box>
            
            <SelectField
              label="Home Country"
              value={homeCountry}
              onChange={(e) => setHomeCountry(e.target.value)}
              options={popularCountries}
            />

            {/* Profile Picture */}
            <MUI.Box>
              <MUI.Typography fontWeight="bold" mb={1} sx={{ color: '#555' }}>
                Profile Picture URL
              </MUI.Typography>
              <MUI.Box display="flex" gap="20px" alignItems="center">
                <SettingTextField
                  label="Image URL"
                  value={profilePictureURL}
                  onChange={(e) => setProfilePictureURL(e.target.value)}
                  id="profile-picture-input"
                  type="text"
                />
                {profilePictureURL && (
                  <MUI.Box
                    sx={{
                      width: '60px',
                      height: '60px',
                      border: '3px solid black',
                      boxShadow: '3px 3px 0px 0px #000000',
                      backgroundImage: `url(${profilePictureURL})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      bgcolor: 'white',
                    }}
                  />
                )}
              </MUI.Box>
            </MUI.Box>

            <MUI.Button
              variant="contained"
              onClick={handleSaveProfileCustomization}
              disabled={!isProfileFormChanged() || isSaving}
              startIcon={isSaving ? <MUI.CircularProgress size={20} color="inherit"/> : <Save />}
              sx={{
                bgcolor: '#4d79ff',
                color: 'white',
                fontWeight: '900',
                fontSize: '14px',
                padding: '12px 30px',
                border: '3px solid black',
                borderRadius: '0px',
                boxShadow: '5px 5px 0px 0px #000000',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                alignSelf: 'flex-start',
                '&:hover': {
                  bgcolor: '#3d69ff',
                  transform: 'translate(2px, 2px)',
                  boxShadow: '3px 3px 0px 0px #000000',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#999',
                  border: '3px solid #ccc',
                  boxShadow: 'none',
                },
                transition: 'all 0.1s ease',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Customization'}
            </MUI.Button>
          </AccountSettingBox>
        </MUI.Box>

        {/* 4. Riot Accounts */}
        <MUI.Box ref={riotAccountsRef}>
          <AccountSettingBox
            title="Riot Accounts"
            description="Connect your Riot Games accounts (Coming Soon)"
          >
            <MUI.Typography color="#999" fontStyle="italic">
              This feature will allow you to verify and display your Riot accounts.
            </MUI.Typography>
          </AccountSettingBox>
        </MUI.Box>

        {/* 5. Account Actions */}
        <MUI.Box ref={accountActionsRef}>
          <AccountSettingBox
            title="Account Actions"
            description="Manage your account security and sessions"
          >
            <MUI.Box display="flex" flexDirection="column" gap="15px">
              <MUI.Button
                variant="contained"
                onClick={handleLogout}
                startIcon={<Logout />}
                sx={{
                  bgcolor: '#ffa500',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '14px',
                  padding: '12px 30px',
                  border: '3px solid black',
                  borderRadius: '0px',
                  boxShadow: '5px 5px 0px 0px #000000',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  alignSelf: 'flex-start',
                  '&:hover': {
                    bgcolor: '#ff9500',
                    transform: 'translate(2px, 2px)',
                    boxShadow: '3px 3px 0px 0px #000000',
                  },
                  transition: 'all 0.1s ease',
                }}
              >
                Log Out
              </MUI.Button>

              <MUI.Divider sx={{ bgcolor: '#555', my: 2 }} />

              <MUI.Typography color="#ff6b6b" fontWeight="bold" fontSize="12px">
                DANGER ZONE
              </MUI.Typography>
              <MUI.Button
                variant="outlined"
                startIcon={<DeleteForever />}
                sx={{
                  color: '#ff4d4d',
                  borderColor: '#ff4d4d',
                  fontWeight: '900',
                  fontSize: '12px',
                  padding: '10px 25px',
                  border: '3px solid #ff4d4d',
                  borderRadius: '0px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  alignSelf: 'flex-start',
                  '&:hover': {
                    bgcolor: 'rgba(255,77,77,0.1)',
                    borderColor: '#ff0000',
                    color: '#ff0000',
                  },
                }}
              >
                Delete Account
              </MUI.Button>
            </MUI.Box>
          </AccountSettingBox>
        </MUI.Box>
      </MUI.Stack>
    </MUI.Box>
  );
};

export default AccountManagement;