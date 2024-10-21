import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '/Users/leo/Desktop/blue/frontend/src/authentication/AuthContext.js';

// This component is like a guard for our private pages
const PrivateRoute = ({ children }) => {
  // Get the current auth status
  const { auth } = useAuth();
  console.log('PrivateRoute: Current auth state:', auth);

  // If we're still checking the auth status, show a loading message
  if (auth.isLoading) {
    console.log('PrivateRoute: Auth is still loading');
    return <div>Loading...</div>; // You could replace this with a nice loading spinner component
  }

  // If the user isn't logged in, send them to the login page
  if (!auth.isAuthenticated) {
    console.log('PrivateRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // If the user is logged in, show the page they wanted to see
  console.log('PrivateRoute: User authenticated, rendering protected route');
  return children;
};

export default PrivateRoute;