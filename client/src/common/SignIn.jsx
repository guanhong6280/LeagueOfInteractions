import React from "react";
import * as MUI from "@mui/material";
import { useAuth } from "../AuthProvider";
import SignInDialog from "./SignInDialog";
import { Link } from "react-router-dom";

const SignIn = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { user, loading, setLoading, login, logout } = useAuth();
  const open = Boolean(anchorEl);

  const handleSignIn = () => {
    setLoading(true);
    // window.location.href = "http://localhost:5174/api/auth/google";
    window.open("http://localhost:5174/api/auth/google", "_self");
    console.log(user);
  };

  const handleTest = () => {
    console.log(user);
    console.log(document.cookie);
  }

  const openMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = (event) => {
    setAnchorEl(null);
  };

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  }

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
            <MUI.MenuItem onClick={logout}>Logout</MUI.MenuItem>
          </MUI.Menu>
        </>
      ) : (
        <MUI.Button variant="contained" color="primary" onClick={openDialog}>
          SIGN IN
        </MUI.Button>
      )}
      <MUI.Button component={Link} to="/add" variant="contained" color="primary">
        Add Interaction
      </MUI.Button>
      <SignInDialog dialogOpen={dialogOpen} onClose={closeDialog} handleSignIn={handleSignIn}></SignInDialog>
    </MUI.Box>
  )
}

export default SignIn