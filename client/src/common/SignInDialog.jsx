import React from 'react';
import * as MUI from '@mui/material';
import googleIcon from '../assets/google_icon.svg';

const SignInDialog = (props) => {
  return (
    <MUI.Dialog open={props.dialogOpen} onClose={props.onClose}>
      <MUI.DialogTitle>
        <MUI.Typography display="flex" alignItems="center" justifyContent="center">LOG IN</MUI.Typography>
      </MUI.DialogTitle>
      <MUI.DialogActions>
        <MUI.Stack>
          <MUI.Button
            color="primary"
            variant="contained"
            startIcon={<img src={googleIcon} alt='google' width="24px" height="24px" />}
            onClick={props.handleSignIn}
          >
            Continue with Google
          </MUI.Button>
        </MUI.Stack>
      </MUI.DialogActions>
    </MUI.Dialog>
  );
};

export default SignInDialog;
