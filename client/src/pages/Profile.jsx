import React from 'react';
import * as MUI from '@mui/material';
import { useParams } from 'react-router-dom';
import useUserProfile from '../hooks/useUserProfile';
import ProfileHeroCard from '../common/profile/ProfileHeroCard';
import ActivityTimeline from '../common/profile/ActivityTimeline';

const UserProfile = () => {
  const { username } = useParams(); // Get username from URL
  
  // Custom hook handles all data fetching and state management
  const {
    profileUser,
    favoriteSkins,
    isLoading,
    error,
    isOwnProfile,
  } = useUserProfile(username);

  if (isLoading) {
    return (
      <MUI.Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#0AC8B9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MUI.CircularProgress size={60} sx={{ color: 'black' }} />
      </MUI.Box>
    );
  }

  if (error || !profileUser) {
    return (
      <MUI.Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#0AC8B9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <MUI.Box
          sx={{
            bgcolor: 'white',
            border: '4px solid black',
            boxShadow: '8px 8px 0px 0px #000000',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <MUI.Typography fontSize="24px" fontWeight="900" mb={1}>
            Profile Not Found
          </MUI.Typography>
          <MUI.Typography color="#666">
            {error || 'The user you are looking for does not exist.'}
          </MUI.Typography>
        </MUI.Box>
      </MUI.Box>
    );
  }

  return (
    <MUI.Box
      sx={{
        minHeight: '100vh',
        paddingY: '60px',
        paddingX: { xs: '20px', md: '60px', lg: '100px' },
      }}
    >
      <MUI.Box
        sx={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Hero Section */}
        <ProfileHeroCard user={profileUser} isOwnProfile={isOwnProfile} />

        {/* Recent Activity */}
        <ActivityTimeline userId={profileUser.id} />
      </MUI.Box>
    </MUI.Box>
  );
};

export default UserProfile;
