import React from "react";
import * as MUI from "@mui/material";
import { Link } from "react-router-dom";

const ProfileDropDown = ({ anchorEl, handleMouseLeave, logout }) => {
  return (
    <MUI.Popover
      id="hover-popover"
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleMouseLeave}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      disableRestoreFocus
      sx={{ pointerEvents: "none" }}
    >
      <MUI.MenuItem onClick={() => alert("Profile clicked")}>
        Profile
      </MUI.MenuItem>
      <MUI.MenuItem
        component={Link}
        to="/add"
        sx={{
          "&:hover": { color: "third.main" },
          fontWeight: 600,
        }}
      >
        Add Interaction
      </MUI.MenuItem>
      <MUI.MenuItem onClick={logout}>Logout</MUI.MenuItem>
    </MUI.Popover>
  );
};

export default ProfileDropDown;

