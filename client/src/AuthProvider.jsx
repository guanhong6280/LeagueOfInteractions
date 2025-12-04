import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create AuthContext
const AuthContext = createContext();

// Create a custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// Create AuthProvider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5174'}/api/auth/user`, { withCredentials: true });
        setUser(data);
        console.log('log data from authprovider');
        console.log(data);
      } catch (error) {
        console.error('Failed to fetch user', error);
        setUser(null); // Explicitly set user to null on error
      } finally {
        setLoading(false); // Always set loading to false when done
      }
    };

    fetchUser(); // Always fetch user on mount
  }, []);

  const login = (userData) => {

  };

  const logout = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5174'}/api/auth/logout`, { withCredentials: true });
      if (response.status === 200) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
