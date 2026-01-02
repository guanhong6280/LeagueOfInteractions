import React from 'react';
import * as MUI from '@mui/material';
import { Navigate } from 'react-router-dom';
import useCurrentUser from '../../../hooks/useCurrentUser';

const AdminGuard = ({ children }) => {
  const { user, isLoading } = useCurrentUser();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <MUI.Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <MUI.CircularProgress size={60} />
        <MUI.Typography variant="h6" sx={{ ml: 2 }}>
          Verifying admin access...
        </MUI.Typography>
      </MUI.Box>
    );
  }

  // Redirect to home if user is not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if user has admin privileges
  // You can adjust this logic based on your user object structure
  const isAdmin = user.isAdministrator

  // Show unauthorized access page if user is not admin
  if (!isAdmin) {
    return (
      <MUI.Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
        px={3}
      >
        <MUI.Box textAlign="center" maxWidth={500}>
          <MUI.Typography variant="h3" color="error.main" gutterBottom>
            403
          </MUI.Typography>
          <MUI.Typography variant="h5" gutterBottom>
            Access Denied
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary" paragraph>
            You don't have permission to access this admin area. 
            Please contact an administrator if you believe this is an error.
          </MUI.Typography>
          <MUI.Button
            variant="contained"
            color="primary"
            onClick={() => window.history.back()}
            sx={{ mt: 2 }}
          >
            Go Back
          </MUI.Button>
        </MUI.Box>
      </MUI.Box>
    );
  }

  // Render admin content if user is authorized
  return children;
};

export default AdminGuard; 