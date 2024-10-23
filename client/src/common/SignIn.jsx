import React from "react";
import * as MUI from "@mui/material";
import { useAuth } from "../AuthProvider";

const SignIn = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { user, loading, login, logout } = useAuth();
  const open = Boolean(anchorEl);

  const handleSignIn = () => {
    window.location.href = "http://localhost:5174/api/auth/google";
    console.log(user);
  };

  const openMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = (event) => {
    setAnchorEl(null);
  };

  return (
    <MUI.Box display="flex" alignItems="center" justifyContent="center" gap="15px" marginLeft="auto" marginRight="20px">
      {loading ? (
        <MUI.CircularProgress />
      ) : user ? (
        <>
          <MUI.Typography>{user.username}</MUI.Typography>
          <MUI.Avatar alt={user.username} src={user.profilePictureURL} onClick={openMenu} />
          <MUI.Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={closeMenu}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MUI.MenuItem onClick={closeMenu}>Profile</MUI.MenuItem>
            <MUI.MenuItem onClick={closeMenu}>Logout</MUI.MenuItem>
          </MUI.Menu>
        </>
      ) : (
        <MUI.Button variant="contained" color="primary" onClick={handleSignIn}>
          SIGN IN
        </MUI.Button>
      )}
    </MUI.Box>
  )
}

export default SignIn