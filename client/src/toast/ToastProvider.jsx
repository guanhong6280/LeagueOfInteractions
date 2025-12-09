import { Toaster } from 'react-hot-toast';

/**
 * Mount this once near the app root (e.g., inside main.jsx layout).
 * Styles lean neo-brutalist: sharp corners, thick borders, offset shadow.
 */
export function ToastProvider() {
  return (
    <Toaster
      toastOptions={{
        style: {
          background: '#fdf6e3', // paper yellow/cream
          color: '#0f172a', // near-black
          border: '3px solid #0f172a',
          borderRadius: '0',
          boxShadow: '8px 8px 0 #0f172a',
          fontFamily: '"Inter", "DM Sans", system-ui, -apple-system, sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.01em',
        },
        success: {
          iconTheme: { primary: '#16a34a', secondary: '#fdf6e3' },
          style: { background: '#bbf7d0' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fdf6e3' },
          style: { background: '#fecdd3' },
        },
        loading: {
          iconTheme: { primary: '#0ea5e9', secondary: '#fdf6e3' },
          style: { background: '#bae6fd' },
        },
      }}
    />
  );
}

