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
        <MUI.Box
          minHeight="95vh"
          sx={{
            backgroundImage: `url(https://cmsassets.rgpub.io/sanity/images/dsfx7636/universe/f81004a39c5502d766169beb4a342c46b0030d36-1920x946.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
          <Outlet />
        </MUI.Box>
        <Footer></Footer>
      </MUI.ThemeProvider>
    </>
  );
}

export default App
