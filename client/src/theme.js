// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff',
      contrastText: '#blue',
    },
    secondary: {
      main: '#999393',
      contrastText: '#ffffff',
    },
    third: {
      main: '#0AC8B9',
      contrastText: '#C89B3C',
    },
    fourth: {
      main: '#292929',
      contrastText: '#292929',
    },
    background: {
      default: '#0397AB',
      paper: '#ffffff',
    },
  },
});

export default theme;
