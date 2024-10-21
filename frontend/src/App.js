import { BrowserRouter, Route, Routes } from "react-router-dom";
import LogIn from './login/LogIn';
import SignUp from './signup/SignUp';
import Main from './main/Main';
//import Private from "./Private";
import ErrorScreen from "./error/ErrorScreen.js";
import { createContext, useState, useEffect } from 'react';
import { PrivateDashBoard, PrivateResults } from "/Users/leo/Desktop/blue/frontend/src/private/PrivateComponents.js";
import { AuthProvider } from "/Users/leo/Desktop/blue/frontend/src/authentication/AuthContext.js";
import CustomCursor from '/Users/leo/Desktop/blue/frontend/src/customCursor/CustomCursor.js';


function App() {

  return (
<AuthProvider>
<div className="custom-cursor">
<CustomCursor />
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/error" element={<ErrorScreen />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/dashboard" element={<PrivateDashBoard />} />
          <Route path="/result" element={<PrivateResults />} />
      </Routes>
    </BrowserRouter>
    </div>
  </AuthProvider>
  );
}

export default App;
