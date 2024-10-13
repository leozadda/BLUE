import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import { useContext } from 'react';
import Dashboard from './dashboard/Dashboard';
//import { AuthContext } from '/Users/leo/Documents/fitness/src/App.js';
import SearchResult from './dashboard/SearchResult';

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
