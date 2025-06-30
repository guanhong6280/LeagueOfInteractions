import React from "react";
import * as MUI from "@mui/material";
import { useAuth } from "../AuthProvider";
import SignInDialog from "./SignInDialog";
import { Link } from "react-router-dom";
import ProfileDropDown from "./ProfileDropDown";
import NavButton from "./button/NavButton";

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
    window.open("http://localhost:5174/api/auth/google", "_self");
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
      gap="15px"
      marginLeft="auto"
      marginRight="40px"
    >
      <NavButton
        buttonColor="primary"
        variant="text"
        pageLocation="/skin_rating"
        hoverColor="third.main"
        buttonText="Skin Rating"
      />
      <NavButton
        buttonColor="primary"
        variant="text"
        pageLocation="/donation"
        hoverColor="third.main"
        buttonText="Donate"
      />
      {loading ? (
        <MUI.CircularProgress />
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
              variant="circular"
              sx={{
                border: "2px solid #0AC8B9", // Add a white border of 2px
                cursor: "pointer",
                position: "relative",
                zIndex: 2000,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                transform: menuOpen
                  ? "translateY(15px) scale(1.5)" // Move down and scale when menu is open
                  : "translateY(0) scale(1)", // Reset position and scale when menu is closed
                boxShadow: menuOpen
                  ? "0 4px 8px rgba(0, 0, 0, 0.2)"
                  : "none",
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
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              sx={{
                alignItems: "center",
                '& .MuiPaper-root': {
                  width: '200px', // Fixed width
                },
              }}
            >
              <MUI.Stack marginTop="15px" alignItems="center">
                <MUI.Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {user.username}
                </MUI.Typography>
              </MUI.Stack>
              <MUI.MenuItem onClick={() => alert('Profile clicked')}>
                Profile
              </MUI.MenuItem>
              <MUI.MenuItem component={Link} to="/setting">
                Setting
              </MUI.MenuItem>
              <MUI.MenuItem component={Link} to="/add">
                Add Interaction
              </MUI.MenuItem>
              <MUI.Divider />
              <MUI.MenuItem onClick={logout}>
                Logout
              </MUI.MenuItem>
            </MUI.Menu>
          </div>
          <MUI.Typography fontSize="15px" fontWeight="600" color="primary">
            {user.username}
          </MUI.Typography>
        </>
      ) : (
        <MUI.Button variant="outlined" color="third" onClick={openDialog}>
          <MUI.Typography fontSize="15px" fontWeight="600">
            Login
          </MUI.Typography>
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
