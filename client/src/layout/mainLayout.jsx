import * as MUI from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';

import "../App.css"
import theme from '../theme/theme';
import Navigation from '../common/Navigation';
import Footer from '../common/footer/Footer';

function MainLayout() {
  const location = useLocation();
  const isSkinRatingPage = location.pathname === '/skin_rating';
  const isSkinDetailPage = location.pathname.startsWith('/champion-skin-details/');

  return (
    <>
      <MUI.ThemeProvider theme={theme}>
        {!isSkinDetailPage && <Navigation></Navigation>}
        <MUI.Box
          minHeight="95vh"
          sx={
            isSkinRatingPage || isSkinDetailPage ?
              {} :
              {
                backgroundImage: `url(https://cmsassets.rgpub.io/sanity/images/dsfx7636/universe/f81004a39c5502d766169beb4a342c46b0030d36-1920x946.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
          }>
          <Outlet />
        </MUI.Box>
        {!isSkinDetailPage && <Footer></Footer>}
      </MUI.ThemeProvider>
    </>
  );
}

export default MainLayout;
