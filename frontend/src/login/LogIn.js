import React, { useState } from 'react';
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from '../authentication/AuthContext';
import './LogIn.css';

const LogIn = () => {
  // Hook to handle navigation
  const navigate = useNavigate();
  // Get auth state and login function from our auth context
  const { auth, login } = useAuth();
  // State for email and password inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State for any error messages
  const [error, setError] = useState('');

  // If user is already logged in, send them to the dashboard
  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    console.log('Trying to log in with email:', email);

    try {
      // Send login request to the server
      const response = await fetch(`${process.env.BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Server responded with status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, got user data:', data);

        // Update our app's auth state
        await login(data.user, data.token, data.refreshToken);

        console.log('Moving to dashboard page');
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        console.log('Login failed:', errorData);
        setError(errorData.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Something went wrong during login:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  // The UI part stays the same
  return (
    <div className="LogIn">
      <div className="loginbox">
        <h1>B-L-U-E</h1>
        {error && <p className="error">{error}</p>}
        <input 
          type="text" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Submit</button>
      </div>
    </div>
  );
};

export default LogIn;