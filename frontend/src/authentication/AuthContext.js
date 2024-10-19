import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Create a new context for authentication
const AuthContext = createContext(null);

// This component will wrap our entire app and provide authentication information to all components
export const AuthProvider = ({ children }) => {
  // Set up the state to store authentication info
  const [auth, setAuth] = useState({
    isAuthenticated: false, // Is the user logged in?
    user: null,             // User's basic info
    token: null,            // The "key" that proves the user is logged in
    refreshToken: null,     // A special key to get a new "key" when the old one expires
  });

  // This function gets a new "key" (token) when the old one is about to expire
  const refreshAccessToken = useCallback(async () => {
    try {
      // Ask the server for a new key
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: auth.refreshToken }),
      });

      if (response.ok) {
        // If we got a new key, update our auth info
        const data = await response.json();
        setAuth(prev => ({ ...prev, token: data.token }));
        return data.token;
      } else {
        // If we couldn't get a new key, log out the user
        logout();
        throw new Error('Unable to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  }, [auth.refreshToken]);

  // When the app starts, check if we have saved login info
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      setAuth(parsedAuth);
    }
  }, []);

  // This function runs when a user logs in
  const login = (userData, token, refreshToken) => {
    console.log('Login called:', { userData, token, refreshToken });
    const authData = { 
      isAuthenticated: true, 
      user: userData,
      token,
      refreshToken,
    };
    setAuth(authData);
    // Save login info so the user stays logged in even if they close the browser
    localStorage.setItem('auth', JSON.stringify(authData));
  };

  // This function runs when a user logs out
  const logout = () => {
    setAuth({ isAuthenticated: false, user: null, token: null, refreshToken: null });
    // Remove saved login info
    localStorage.removeItem('auth');
  };

  // Provide the authentication info and functions to all child components
  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// This is a shortcut for other components to use the authentication info
export const useAuth = () => useContext(AuthContext);