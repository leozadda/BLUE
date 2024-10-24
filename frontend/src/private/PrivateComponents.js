// Private.js
import React from 'react';
import Dashboard from '../dashboard/Dashboard';
import SearchResult from '../search/SearchResult';
import PrivateRoute from './PrivateRoutes.js';

// This function wraps the Dashboard component with our guard (PrivateRoute)
export function PrivateDashBoard() {
  return (
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  );
}

// This function wraps the SearchResult component with our guard (PrivateRoute)
export function PrivateResults() {
  return (
    <PrivateRoute>
      <SearchResult />
    </PrivateRoute>
  );
}