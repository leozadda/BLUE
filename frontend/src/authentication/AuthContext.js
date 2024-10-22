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
    isLoading: true,        // Are we still checking if the user is logged in?
  });

  // This function gets a new "key" (token) when the old one is about to expire
  const refreshAccessToken = useCallback(async () => {
    console.log('Attempting to refresh access token');
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
        console.log('Access token refreshed successfully');
        return data.token;
      } else {
        // If we couldn't get a new key, log out the user
        console.log('Failed to refresh token. Logging out user.');
        logOff();
        throw new Error('Unable to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logOff();
    }
  }, [auth.refreshToken]);

  // When the app starts, check if we have saved login info
  useEffect(() => {
    console.log('AuthProvider mounted. Checking for stored auth data.');
    const initializeAuth = async () => {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        console.log('Found stored auth data. Restoring session.');
        const parsedAuth = JSON.parse(storedAuth);
        setAuth({ ...parsedAuth, isLoading: false });
      } else {
        console.log('No stored auth data found. User is not authenticated.');
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // This function runs when a user logs in
  const login = (userData, token, refreshToken) => {
    console.log('Login called with user data:', userData);
    const authData = { 
      isAuthenticated: true, 
      user: userData,
      token,
      refreshToken,
      isLoading: false,
    };
    setAuth(authData);
    // Save login info so the user stays logged in even if they close the browser
    localStorage.setItem('auth', JSON.stringify(authData));
    console.log('User logged in and auth data saved to local storage');
  };

  // This function runs when a user logs out
  const logOff = () => {
    console.log('LogOff called. Clearing auth data.');
    setAuth({ isAuthenticated: false, user: null, token: null, refreshToken: null, isLoading: false });
    // Remove saved login info
    localStorage.removeItem('auth');
    console.log('User logged out and auth data removed from local storage');
  };

  // Provide the authentication info and functions to all child components
  return (
    <AuthContext.Provider value={{ auth, login, logOff, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// This is a shortcut for other components to use the authentication info
export const useAuth = () => useContext(AuthContext);