import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from "axios";

// Create AuthContext
const AuthContext = createContext();

// Create a custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// Create AuthProvider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const { data } = await axios.get('http://localhost:5174/api/auth/user', {withCredentials: true}); // Replace with your actual endpoint
  //       setUser(data);  // Assuming the backend returns { user: ... }
  //       console.log("log data from authprovider")
  //       console.log(data);
  //     } catch (error) {
  //       console.error('Failed to fetch user', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchUser();
  // }, []);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('http://localhost:5174/api/auth/user', { withCredentials: true }); // Replace with your actual endpoint
      setUser(data);  // Assuming the backend returns { user: ... }
      console.log("log data from authprovider")
      console.log(data);
    } catch (error) {
      console.error('Failed to fetch user', error);
    } finally {
      setLoading(false);
    }
  };
  // Mock login function
  const login = (userData) => {

  };

  const logout = async () => {
    try {
      const response = await axios.get('http://localhost:5174/api/auth/logout', { withCredentials: true });
      if (response.status === 200) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
