import React from 'react';
import * as MUI from '@mui/material';
import googleIcon from '../../assets/google_icon.svg';

const SignInDialog = (props) => {
  return (
    <MUI.Dialog
      open={props.dialogOpen}
      onClose={props.onClose}
      PaperProps={{
        sx: {
          border: '3px solid #000',
          borderRadius: 0,
          boxShadow: '8px 8px 0px #000',
          backgroundColor: '#fff',
          overflow: 'visible', // Ensure shadow isn't clipped
        }
      }}
    >
      <MUI.DialogTitle sx={{ borderBottom: '3px solid #000', p: 2 }}>
        <MUI.Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 900,
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#000',
          }}
        >
          LOG IN
        </MUI.Typography>
      </MUI.DialogTitle>
      
      <MUI.DialogActions sx={{ p: 4, justifyContent: 'center' }}>
        <MUI.Stack spacing={2} sx={{ width: '100%' }}>
          <MUI.Button
            disableElevation
            variant="contained"
            startIcon={<img src={googleIcon} alt='google' width="24px" height="24px" />}
            onClick={props.handleSignIn}
            sx={{
              backgroundColor: '#fff',
              color: '#000',
              border: '2px solid #000',
              borderRadius: 0,
              boxShadow: '4px 4px 0px #000',
              fontWeight: 700,
              padding: '12px 24px',
              textTransform: 'none',
              fontSize: '1rem',
              transition: 'all 0.1s ease-in-out',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                transform: 'translate(2px, 2px)',
                boxShadow: '2px 2px 0px #000',
              },
              '&:active': {
                transform: 'translate(4px, 4px)',
                boxShadow: '0px 0px 0px #000',
              }
            }}
          >
            Continue with Google
          </MUI.Button>
        </MUI.Stack>
      </MUI.DialogActions>
    </MUI.Dialog>
  );
};

export default SignInDialog;
