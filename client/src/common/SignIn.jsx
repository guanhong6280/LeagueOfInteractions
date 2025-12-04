import React from 'react';
import * as MUI from '@mui/material';
import { useAuth } from '../AuthProvider';
import SignInDialog from './SignInDialog';
import { Link } from 'react-router-dom';
import ProfileDropDown from './ProfileDropDown';
import NavButton from './button/NavButton';

const SignIn = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { user, loading, setLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const avatarRef = React.useRef(null);

  const handleMouseEnter = () => {
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    setMenuOpen(false);
  };

  const handleSignIn = () => {
    setLoading(true);
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5174'}/api/auth/google`, '_self');
  };

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  return (
    <MUI.Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="20px"
      marginLeft="auto"
      marginRight="40px"
    >
      <MUI.Button
        component={Link}
        to="/rating_landing"
        sx={{
          color: 'black',
          fontWeight: 900,
          textTransform: 'uppercase',
          border: '2px solid transparent',
          borderRadius: '0px',
          '&:hover': {
            backgroundColor: '#FFDE00',
            border: '2px solid black',
            boxShadow: '4px 4px 0px black',
            transform: 'translate(-2px, -2px)',
          },
          transition: 'all 0.2s',
        }}
      >
        Rating
      </MUI.Button>
      <MUI.Button
        component={Link}
        to="/donation"
        sx={{
          color: 'black',
          fontWeight: 900,
          textTransform: 'uppercase',
          border: '2px solid transparent',
          borderRadius: '0px',
          '&:hover': {
            backgroundColor: '#FFDE00',
            border: '2px solid black',
            boxShadow: '4px 4px 0px black',
            transform: 'translate(-2px, -2px)',
          },
          transition: 'all 0.2s',
        }}
      >
        Donate
      </MUI.Button>
      
      {loading ? (
        <MUI.CircularProgress size={30} sx={{ color: 'black' }} />
      ) : user ? (
        <>
          <div
            style={{ display: 'inline-block' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <MUI.Avatar
              ref={avatarRef}
              alt={user.username}
              src={user.profilePictureURL}
              variant="square" // Changed to square for brutalism
              sx={{
                width: 45,
                height: 45,
                border: '3px solid black',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 2000,
                transition: 'all 0.2s ease',
                boxShadow: '4px 4px 0px black',
                '&:hover': {
                   transform: 'translate(-2px, -2px)',
                   boxShadow: '6px 6px 0px black',
                },
                ...(menuOpen && {
                  transform: 'translate(-2px, -2px)',
                  boxShadow: '6px 6px 0px black',
                })
              }}
            />
            <MUI.Menu
              disablePortal
              anchorEl={avatarRef.current}
              open={menuOpen}
              onClose={handleMouseLeave}
              MenuListProps={{
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right', // Align to right
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                '& .MuiPaper-root': {
                  width: '220px',
                  borderRadius: '0px',
                  border: '3px solid black',
                  boxShadow: '8px 8px 0px black',
                  marginTop: '10px',
                },
                '& .MuiMenuItem-root': {
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #eee',
                  '&:hover': {
                    backgroundColor: '#FFDE00',
                    color: 'black',
                  }
                }
              }}
            >
              <MUI.Stack 
                padding="15px" 
                alignItems="center" 
                borderBottom="3px solid black" 
                bgcolor="#f0f0f0"
              >
                <MUI.Typography variant="subtitle1" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
                  {user.username}
                </MUI.Typography>
              </MUI.Stack>
              
              {user.isAdministrator && (
                <MUI.MenuItem component={Link} to="/admin/comments">
                  Moderation
                </MUI.MenuItem>
              )}
              <MUI.MenuItem component={Link} to="/setting">
                Settings
              </MUI.MenuItem>
              <MUI.MenuItem component={Link} to="/add">
                Add Interaction
              </MUI.MenuItem>
              <MUI.Divider sx={{ borderBottomWidth: '3px', borderColor: 'black' }} />
              <MUI.MenuItem onClick={logout} sx={{ color: 'red' }}>
                LOGOUT
              </MUI.MenuItem>
            </MUI.Menu>
          </div>
        </>
      ) : (
        <MUI.Button 
          onClick={openDialog}
          variant="contained"
          sx={{
            backgroundColor: 'black',
            color: 'white',
            fontWeight: 900,
            borderRadius: '0px',
            textTransform: 'uppercase',
            border: '2px solid black',
            boxShadow: '4px 4px 0px #888',
            '&:hover': {
              backgroundColor: '#fff',
              color: 'black',
              boxShadow: '6px 6px 0px black',
            }
          }}
        >
          Login
        </MUI.Button>
      )}
      <SignInDialog
        dialogOpen={dialogOpen}
        onClose={closeDialog}
        handleSignIn={handleSignIn}
      />
    </MUI.Box>
  );
};

export default SignIn;
