import * as MUI from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';

import "../App.css"
import theme from '../theme/theme';
import Navigation from '../common/navigation/Navigation';
import Footer from '../common/footer/Footer';

function MainLayout() {
  const location = useLocation();
  const isSkinDetailPage = location.pathname.startsWith('/champion-skin-details/');
  const isChampionRatingPage = location.pathname.startsWith('/champion-rating/');

  return (
    <>
      <MUI.ThemeProvider theme={theme}>
        {!isSkinDetailPage && !isChampionRatingPage && <Navigation></Navigation>}
        {/* <MUI.Box minHeight="95vh"> */}
        <MUI.Box>
          <Outlet />
        </MUI.Box>
        {!isSkinDetailPage && <Footer></Footer>}
      </MUI.ThemeProvider>
    </>
  );
}

export default MainLayout;
