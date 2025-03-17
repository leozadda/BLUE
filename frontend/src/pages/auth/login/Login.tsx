// Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { CredentialResponse } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from '../custom-google-button/google-login-button/GoogleLoginButton';
import { useAuth } from '../auth-context/AuthContext';
import { authFetch } from '../token/authFetch';

//ENV variables imported
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Interface for the data we expect from the server
interface UserData {
  success?: boolean;
  isNewUser?: boolean;
  message?: string;
  user?: {
    id: number;
    email: string;
    username?: string;
    created_at?: string;
  };
}

const Login = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  //This should handle the email/password option (not google)
  const handleLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setError('');
  
    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      console.warn('❌ Email validation failed:', email);
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 12) {
      console.warn('❌ Password validation failed: Length:', password.length);
      setError('Password must be at least 12 characters long');
      return;
    }
  
    try {
     
      const response = await authFetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      if (response.ok) {
        const data: UserData = await response.json();
       
        
        // Instead of storing token in localStorage, we verify our auth status
       
        
        // Check auth status to update context
        const isAuthenticated = await checkAuthStatus();
        
        if (isAuthenticated) {
          // Navigate to dashboard on success
          navigate('/dashboard/settings');
        } else {
          console.error('❌ Auth cookie verification failed');
          setError('Authentication failed. Please try again.');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Server error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        setError(errorData.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('💥 Network or unexpected error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      setError('Network error occurred. Please try again.');
    }
  };

  //If you click Google sign up this runs
  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
     
      
      if (!credentialResponse.credential) {
        console.error('❌ No credential received from Google');
        setError('Authentication failed - no credential received');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/google-login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: credentialResponse.credential
        }),
      });

      if (response.ok) {
        const data: UserData = await response.json();
        
       
        
        // Check auth status to update context
        const isAuthenticated = await checkAuthStatus();
        
        if (isAuthenticated) {
          // Navigate to dashboard on success
          navigate('/dashboard/settings');
        } else {
          console.error('❌ Auth cookie verification failed');
          setError('Authentication failed. Please try again.');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Server error response:', errorData);
        setError(errorData.error || 'Google login failed. Please try again.');
      }
    } catch (error) {
      console.error('💥 Full error details:', error);
      setError('Network error occurred');
    }
  };

  //Google sign up if it fails
  const handleGoogleLoginError = () => {
   
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="Login">
      <div className="Login-Container">
        <h1>B-L-U-E</h1>
{/*   This should handle the Google option */}
        <div className="google-login">
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleLoginButton
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              clientId={GOOGLE_CLIENT_ID}
            />
          </GoogleOAuthProvider>
        </div>

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
{/*   This should handle the email/password option (not google) */}
        <button className="submit-button" onClick={handleLogin}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Login;