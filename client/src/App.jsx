import * as MUI from "@mui/material";
import { Outlet } from 'react-router-dom';

import './App.css'
import theme from "./theme";
import Navigation from "./common/Navigation";
import Footer from "./common/footer/Footer";

function App() {

  return (
    <>
      <MUI.ThemeProvider theme={theme}>
        <Navigation></Navigation>
        <Outlet />
        <Footer></Footer>
      </MUI.ThemeProvider>
    </>
  );
}

export default App
