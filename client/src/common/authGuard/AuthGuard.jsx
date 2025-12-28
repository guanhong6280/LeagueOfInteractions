import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import * as MUI from '@mui/material';
import useCurrentUser from '../../hooks/useCurrentUser'; // Adjust path if needed

const AuthGuard = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useCurrentUser();

  console.log('isAuthenticated', isAuthenticated);
  // 1. LOADING STATE
  // While React Query is checking session, show a spinner. 
  // Otherwise, the user might be kicked out instantly before the data arrives.
  if (isLoading) {
    return (
      <MUI.Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <MUI.CircularProgress color="inherit" />
      </MUI.Box>
    );
  }

  // 2. UNAUTHENTICATED STATE
  // If loading is done and we still have no user, kick them out.
  if (!isAuthenticated) {
    // Redirect to home (or login), but save where they were trying to go
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 3. AUTHENTICATED
  // If we are here, the user is logged in. Render the protected route.
  return <Outlet />;
};

export default AuthGuard;