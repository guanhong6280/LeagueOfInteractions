import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';


import App from './App.jsx';
import './index.css';
import ViewInteractions from './pages/ViewInteractions.jsx';
import AddInteractions from './pages/AddInteractions.jsx';
import AuthProvider from './AuthProvider.jsx';
import ChampionProvider from './contextProvider/ChampionProvider.jsx';
import Donate from './pages/Donate.jsx';
import AccountManagement from './pages/AccountManagement.jsx';

const stripePromise = loadStripe("your-publishable-key-here");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ChampionProvider>
        <Elements stripe={stripePromise}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />}>
                {/* The default route that shows creators */}
                <Route index element={<ViewInteractions />} />
                <Route path="add" element={<AddInteractions />} />
                <Route path="donation" element={<Donate/>}/>
                <Route path="setting" element={<AccountManagement/>}/>
              </Route>
            </Routes>
          </BrowserRouter>
        </Elements>
      </ChampionProvider>
    </AuthProvider>
  </StrictMode>
)
