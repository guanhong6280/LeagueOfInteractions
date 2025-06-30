import React from 'react';
import * as MUI from "@mui/material";

const AccountSettingBox = ({ title, description, children }) => {
  return (
    <MUI.Box display="flex" width="800px" minHeight="200px" bgcolor="#292727" borderRadius="10px">
      <MUI.Stack width="30%" bgcolor="#211e1f" padding="35px" color="white">
        <MUI.Typography variant='h6'>
          {title}
        </MUI.Typography>
        <MUI.Typography variant='body2' color='#b8b8b8'>
          {description}
        </MUI.Typography>
      </MUI.Stack>
      <MUI.Stack flex="1" padding="35px" gap="20px">
        {children}
      </MUI.Stack>
    </MUI.Box>
  )
}

export default AccountSettingBox