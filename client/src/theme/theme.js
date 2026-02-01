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
      redSide:"#ffe6e6",
      redSide_light:"#fff2f2",
      blueSide:"#e6f3ff",
      blueSide_light:"#f2f9ff",
      neutralSide:"#e6fff0",
      neutralSide_light:"#f2fff7",
    },

    button: {
      redSide:"#ff5959",
      redSide_hover:"#ff3333",
      blueSide:"#59afff",
      blueSide_hover:"#339cff",
      neutralSide_hover:"#33ff85",
      neutralSide:"#80ffb3",
      like_active:"#fff48c",
      like_hover:"#ffeb3b",
      delete_button_hover:"#ff3333",
      view_replies_button_hover:"#c539e4",
      view_replies_button:"#cf72e4",
      reply_button:"#80ffb3",
      reply_button_hover:"#40ff8c",
      expand_button:"#cf72e4",
      expand_button_hover:"#c539e4",
    }
  },
});

export default theme;
