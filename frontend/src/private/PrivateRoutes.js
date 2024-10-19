/*import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import { useContext } from 'react';
import Dashboard from './dashboard/Dashboard';
import { AuthContext } from '/Users/leo/Documents/fitness/src/App.js';
import SearchResult from './dashboard/SearchResult';

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './App';

// Retrieve the string from localStorage
let usero = localStorage.getItem('usero');
// Convert the string back to an object
let user = JSON.parse(usero);

export function PrivateDashBoard() {
    //const { user, setUser } = useContext(AuthContext);
  if (user.authenticated == true) {
    return <Dashboard />;
  } else {
    return <Navigate to='/error' />;
  }
}

export function PrivateResults() {
    //const { user, setUser } = useContext(AuthContext);
  if (user.authenticated == true) {
    return <SearchResult />;
  } else {
    return <Navigate to='/error' />;
  }
}
*/

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '/Users/leo/Desktop/blue/frontend/src/authentication/AuthContext.js';

// This component is like a guard for our private pages
const PrivateRoute = ({ children }) => {
  // Get the current auth status
  const { auth } = useAuth();
  console.log('PrivateRoute auth state:', auth);

  // If the user isn't logged in, send them to the login page
  if (!auth.isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // If the user is logged in, show the page they wanted to see
  console.log('User authenticated, rendering protected route');
  return children;
};

export default PrivateRoute;