import * as MUI from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import { Outlet, Link } from 'react-router-dom';

import './App.css'
import theme from "./theme";
import Navigations from "./common/Navigations";
import ChampionSelectCard from "./common/ChampionSelectCard";

function App() {

  return (
    <>
      <ThemeProvider theme={theme}>
        <Navigations></Navigations>
        {/* <ChampionSelectCard></ChampionSelectCard> */}
        <Outlet />
      </ThemeProvider>
    </>
  );
}

export default App
