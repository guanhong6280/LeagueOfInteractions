// src/hoc/withTheme.jsx
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';

export default function withTheme(theme) {
  return function wrap(Component) {
    const Themed = (props) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...props} />
      </ThemeProvider>
    );

    // helpful for React DevTools
    const compName = Component.displayName || Component.name || 'Component';
    Themed.displayName = `withTheme(${compName})`;

    return Themed;
  };
}