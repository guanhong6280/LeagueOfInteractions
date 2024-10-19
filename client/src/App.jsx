import * as MUI from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import { Outlet, Link } from 'react-router-dom';

import './App.css'
import theme from "./theme";
import Navigations from "./common/Navigations";

function App() {

  return (
    <>
      <ThemeProvider theme={theme}>
        <Navigations></Navigations>
        <Outlet />
      </ThemeProvider>
    </>
  );
}

export default App
