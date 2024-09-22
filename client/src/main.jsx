import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ShowCreators from "./pages/ShowCreators.jsx";
import ViewCreator from './pages/ViewCreator.jsx';
import EditCreator from './pages/EditCreator.jsx';
import AddCreator from './pages/AddCreator.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          {/* The default route that shows creators */}
          <Route index element={<ViewAbilities />} />
          {/* Dynamic route for viewing a creator's details */}
          {/* Route for adding a new creator */}
          <Route path="add" element={<AddInteractions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
