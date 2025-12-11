import React from 'react';
import Alert from '@mui/material/Alert';

const MinimalAlert = ({ severity = 'info', children, sx, ...rest }) => {
  return (
    <Alert
      severity={severity}
      {...rest}
      sx={{
        // Force background and border
        backgroundColor: '#000000 !important',
        color: '#ffffff !important',
        border: '1px solid #878787',
        borderRadius: 2,
        boxShadow: 'none',
        backgroundImage: 'none !important',

        // Ensure icons are white
        '& .MuiAlert-icon': {
          color: '#ffffff !important',
        },
        // Ensure message text is white
        '& .MuiAlert-message': {
          color: '#ffffff !important',
        },
        // Override standard variant styles explicitly
        '&.MuiAlert-standardInfo': {
            backgroundColor: '#000000 !important',
            color: '#ffffff !important',
        },
        '&.MuiAlert-standardSuccess': {
            backgroundColor: '#000000 !important',
            color: '#ffffff !important',
        },
        '&.MuiAlert-standardWarning': {
            backgroundColor: '#000000 !important',
            color: '#ffffff !important',
        },
        '&.MuiAlert-standardError': {
            backgroundColor: '#000000 !important',
            color: '#ffffff !important',
        },
        
        // Merge user provided sx
        ...sx,
      }}
    >
      {children}
    </Alert>
  );
};

export default MinimalAlert;
