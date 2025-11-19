// src/themes/admin.js  (JS version)
import { colors } from '@mui/material';
import { createTheme, alpha } from '@mui/material/styles';

export const adminTheme = createTheme({
  palette: {
    mode: 'dark',

    // Core background + paper (MUI defaults)
    background: {
      default: '#ffffff',   // page bg (outside frame)
      paper: '#000000',   // generic dark surfaces
      progress: '#1a1a1a',
      card: '#000000',
      description: '#111111',
    },

    // Semantic rails / surfaces unique to your admin
    surface: {
      frame: '#0d0d0d',  // the rounded outer container
      main: '#ffffff',  // main content surface (inside AdminMain)
      aside: '#f6f8fb',  // right rail surface
      nav: '#0d0d0d',  // left nav background (same as frame)
      inset: '#111111',  // inner dark surface (between nav and main)
      // helpful “ink”/hairline colors:
      hairlineDark: '#1a1a1a',
      hairlineDarker: '#1f1f1f',
      hairlineLight: '#eef0f3',
    },

    // Brand + status
    primary: { main: '#0070f3' },
    success: { main: '#22c55e' },
    error: { main: '#ef4444' },

    // Text
    text: { primary: '#f5f5f5', secondary: '#a1a1aa' },

    // Dividers & strokes
    divider: '#232323',

    // Action states (you can tune these later)
    action: {
      hoverOpacity: 0.06,
      selectedOpacity: 0.1,
      focusOpacity: 0.12,
      disabledOpacity: 0.38,
    },
  },

  shape: { borderRadius: 8 },

  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    admin_name: { fontSize: "28px", fontWeight: 600 },
    admin_email: { fontSize: "16px", colors: alpha('#ffffff', 0.5) },
    title_text: { fontSize: "32px", fontWeight: 600, color: "#010101" },
    navigation_text: { fontSize: "22px", colors: alpha('#ffffff', 0.5) },
    date_text: { fontSize: "10px", color: '#808080' },
    chip_text: { fontSize: "12px" },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', boxShadow: '0 0 0 1px #1f1f1f' },
      },
    },
    // Optional: unify Divider & ListItemButton hover using theme tokens
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#232323' } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: alpha('#ffffff', 0.06) },
          '&.Mui-selected': {
            backgroundColor: alpha('#ffffff', 0.1),
            '&:hover': { backgroundColor: alpha('#ffffff', 0.14) },
          },
        },
      },
    },
  },
});