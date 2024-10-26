import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx';
import './index.css';
import ViewInteractions from './pages/ViewInteractions.jsx';
import AddInteractions from './pages/AddInteractions.jsx';
import AuthProvider from './AuthProvider.jsx';
import ChampionProvider from './contextProvider/ChampionProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ChampionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              {/* The default route that shows creators */}
              <Route index element={<ViewInteractions />} />
              <Route path="add" element={<AddInteractions />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ChampionProvider>
    </AuthProvider>
  </StrictMode>
)
