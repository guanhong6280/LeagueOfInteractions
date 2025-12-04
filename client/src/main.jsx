import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import MainLayout from './layout/mainLayout.jsx';
import './index.css';
import ViewInteractions from './pages/ViewInteractions.jsx';
import AddInteractions from './pages/AddInteractions.jsx';
import AuthProvider from './AuthProvider.jsx';
import ChampionProvider from './contextProvider/ChampionProvider.jsx';
import { ChampionStatsProvider } from './contextProvider/ChampionStatsProvider.jsx';
import { VersionProvider } from './contextProvider/VersionProvider.jsx';
import { QueryProvider } from './contextProvider/QueryProvider.jsx';
import Donate from './pages/Donate.jsx';
import AccountManagement from './pages/AccountManagement.jsx';
import Contact from './pages/Contact.jsx';
import RatingLanding from './pages/RatingLanding.jsx';
import { ChampionRatingPage, ChampionSkinRatingPage } from './common/rating_system/index.js';

// Admin imports
import AdminGuard from './admin/components/guards/AdminGuard.jsx';
import AdminLayout from './layout/index.jsx';
import CommentModeration from './admin/Pages/CommentModeration.jsx';
import VideoModeration from './admin/Pages/VideoModeration.jsx';
import AdminSettings from './admin/Pages/AdminSettings.jsx';

const stripePromise = loadStripe('your-publishable-key-here');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <VersionProvider>
          <ChampionProvider>
            <ChampionStatsProvider>
              <Elements stripe={stripePromise}>
                <BrowserRouter>
                <Routes>
                  <Route path="/" element={<MainLayout />}>
                    {/* The default route that shows creators */}
                    <Route index element={<ViewInteractions />} />
                    <Route path="add" element={<AddInteractions />} />
                    <Route path="rating_landing" element={<RatingLanding />} />
                    <Route path="donation" element={<Donate />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="setting" element={<AccountManagement />} />
                    <Route path="/champion-skin-details/:championName" element={<ChampionSkinRatingPage />} />
                    <Route path="/champion-rating/:championName" element={<ChampionRatingPage />} />
                  </Route>
                  
                  {/* Admin Routes - Protected by AdminGuard */}
                  <Route path="admin/*"
                    element={
                      <AdminGuard>
                        <AdminLayout />
                      </AdminGuard>
                    }
                  >
                    <Route path="comments" element={<CommentModeration />} />
                    <Route path="videos" element={<VideoModeration />} />
                    <Route path="settings" element={<AdminSettings />} />
                    {/* <Route index element={<AdminDashboard />} /> */}
                    {/* Future admin routes will go here */}
                    {/* <Route path="users" element={<UserManagement />} /> */}
                    {/* <Route path="comments" element={<CommentModeration />} /> */}
                    {/* <Route path="analytics" element={<Analytics />} /> */}
                  </Route>
                </Routes>
                </BrowserRouter>
              </Elements>
            </ChampionStatsProvider>
          </ChampionProvider>
        </VersionProvider>
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
);
