import React from 'react';
import * as MUI from "@mui/material";
import AccountSettingBox from '../common/setting/AccountSettingBox';

const AccountManagement = () => {
  return (
    <MUI.Box
      height="100%"
      width="100%"
      position="relative"
      bgcolor="black"
    >
      <MUI.Stack
        height="500px"
        width="500px"
        position="fixed"  // changed from fixed to absolute
        top="85px"
        left="20px"
        sx={{
          backgroundColor: 'red',
          color: 'white',
        }}
      >
        <MUI.Typography fontSize="28px">
          <span>Account</span>
          <br />
          <span>Management</span>
        </MUI.Typography>
      </MUI.Stack>
      <MUI.Stack marginLeft="40vw" spacing="20px" paddingY="50px">
        {[...Array(10)].map((_, index) => (
          <AccountSettingBox key={index} />
        ))}
      </MUI.Stack>
    </MUI.Box>
  );
};

export default AccountManagement;