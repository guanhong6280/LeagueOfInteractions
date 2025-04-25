import React from 'react';
import * as MUI from "@mui/material";

const AccountSettingBox = ({ title, description, children }) => {
  return (
    <MUI.Box display="flex" width="600px" height="300px" bgcolor="white">
      <MUI.Stack>
        <MUI.Typography>
          {title}
        </MUI.Typography>
        <MUI.Typography>
          {description}
        </MUI.Typography>
      </MUI.Stack>
      <MUI.Stack>
        {children}
      </MUI.Stack>
    </MUI.Box>
  )
}

export default AccountSettingBox