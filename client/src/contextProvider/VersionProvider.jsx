import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCurrentVersion } from '../api/championApi';

const VersionContext = createContext();

export const useVersion = () => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
};

export const VersionProvider = ({ children }) => {
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVersion = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentVersion = await fetchCurrentVersion();
        setVersion(currentVersion);
      } catch (err) {
        console.error('Failed to load version:', err);
        setError(err.message);
        // Set a fallback version
        setVersion('14.19.1');
      } finally {
        setLoading(false);
      }
    };

    loadVersion();
  }, []);

  const value = {
    version,
    loading,
    error,
    refreshVersion: async () => {
      try {
        setLoading(true);
        const currentVersion = await fetchCurrentVersion();
        setVersion(currentVersion);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <VersionContext.Provider value={value}>
      {children}
    </VersionContext.Provider>
  );
}; 