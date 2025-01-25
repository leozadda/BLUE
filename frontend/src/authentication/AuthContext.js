import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Create a new context for authentication
const AuthContext = createContext(null);

// This component will wrap our entire app and provide authentication information to all components
export const AuthProvider = ({ children }) => {
  // Set up the state to store authentication info
  const [auth, setAuth] = useState({
    isAuthenticated: false,    // Is the user logged in?
    user: null,               // User's basic info
    token: null,              // The "key" that proves the user is logged in
    refreshToken: null,       // A special key to get a new "key" when the old one expires
    isLoading: true,          // Are we still checking if the user is logged in?
    hasCompletedPayment: false, // New field to track payment status
    trialEndsAt: null  // Added trial end date tracking
  });

  // This function gets a new "key" (token) when the old one is about to expire
  const refreshAccessToken = useCallback(async () => {
    console.log('Attempting to refresh access token');
    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: auth.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuth(prev => ({ ...prev, token: data.token }));
        console.log('Access token refreshed successfully');
        return data.token;
      } else {
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

  // Updated login function to include payment status
  const login = (userData, token, refreshToken, hasCompletedPayment = false) => {
    console.log('Login called with user data:', userData);
    const authData = { 
      isAuthenticated: true, 
      user: userData,
      token,
      refreshToken,
      isLoading: false,
      hasCompletedPayment, // Include payment status in auth data
      //trialEndsAt,  // Include trial end date
    };
    setAuth(authData);
    localStorage.setItem('auth', JSON.stringify(authData));
    console.log('User logged in and auth data saved to local storage');
  };

  // New function to update payment status
  const updatePaymentStatus = (status) => {
    setAuth(prev => {
      const newAuth = { ...prev, hasCompletedPayment: status };
      localStorage.setItem('auth', JSON.stringify(newAuth));
      return newAuth;
    });
    console.log('Payment status updated:', status);
  };

  // Updated logOff to include payment status reset
  const logOff = () => {
    setAuth({ 
        isAuthenticated: false, 
        user: null, 
        token: null, 
        refreshToken: null, 
        isLoading: false,
        hasCompletedPayment: false,
        trialEndsAt: null 
    });
    localStorage.removeItem('auth');
};

  // Provide the authentication info and functions to all child components
  return (
    <AuthContext.Provider value={{ 
      auth, 
      login, 
      logOff, 
      refreshAccessToken,
      updatePaymentStatus // Make the new function available
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// This is a shortcut for other components to use the authentication info
export const useAuth = () => useContext(AuthContext);