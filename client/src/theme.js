// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6', // Customize with your primary color
    },
    secondary: {
      main: '#19857b', // Customize with your secondary color
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  // Add more customizations here
});

export default theme;
