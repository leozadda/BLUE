// SignUp.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import { CredentialResponse } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleSignupButton from '../custom-google-button/google-signup-button/GoogleSignupButton';
// Import the useAuth hook so we can force an immediate auth check
import { useAuth } from '../auth-context/AuthContext';
import { authFetch } from '../token/authFetch';

// ENV variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_BASE_URL = import.meta.env.VITE_API_URL;

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  // isProcessing is used to display a loading indicator while we wait for auth refresh
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Get checkAuthStatus from our AuthContext so we can force an auth check immediately
  const { checkAuthStatus } = useAuth();

  // Handle email/password sign-up
  const handleSignUp = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setError('');

    // Validate the email using a simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn('❌ Email validation failed:', email);
      setError('Please enter a valid email address');
      return;
    }
    // Validate that password length is at least 12 characters
    if (password.length < 12) {
      console.warn('❌ Password validation failed: Length:', password.length);
      setError('Password must be at least 12 characters long');
      return;
    }

    try {
     
      // Include credentials to ensure cookies are received
      const response = await authFetch(`${API_BASE_URL}/signup`, {
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
       

        // Set processing flag to true to display a loading indicator
        setIsProcessing(true);

        // Force an immediate auth check and wait for it to complete
        await checkAuthStatus();
       

        // Processing is done—remove loading indicator and navigate to dashboard
        setIsProcessing(false);
        navigate('/dashboard/settings');
      } else {
        const errorData = await response.json();
        console.error('❌ Server error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        setError(errorData.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('💥 Network or unexpected error during signup:', error);
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

  // Handle Google sign-up success
  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
     
      if (!credentialResponse.credential) {
        console.error('❌ No credential received from Google');
        setError('Authentication failed - no credential received');
        return;
      }

      // First API call: send the Google credential to your backend
      const response = await fetch(`${API_BASE_URL}/google-login`, {
        method: 'POST',
        credentials: 'include', // Important for receiving cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: credentialResponse.credential
        }),
      });

      if (response.ok) {
       

        // Set processing flag to show a loading indicator while auth check runs
        setIsProcessing(true);
        await checkAuthStatus();
       
        setIsProcessing(false);
        // Navigate to dashboard after auth is confirmed
        navigate("/dashboard/settings");
      } else {
        const errorData = await response.json();
        console.error('❌ Server error response from Google login:', errorData);
        setError(errorData.error || 'Google login failed. Please try again.');
      }
    } catch (error) {
      console.error('💥 Full error details during Google login:', error);
      setError('Network error occurred');
    }
  };

  // Handle Google sign-up error
  const handleGoogleLoginError = () => {
   
    setError('Google login failed. Please try again.');
  };

  // While processing the sign-up and auth check, show a loading screen
  if (isProcessing) {
    return (
      <div className="Sign-Up">
        <div className="Sign-Up-Container">
          <h1>B-L-U-E</h1>
          <p>Loading, please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="Sign-Up">
      <div className="Sign-Up-Container">
        <h1>B-L-U-E</h1>
        {/* Google sign-up section */}
        <div className="google-sign-up">
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleSignupButton
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
        {/* Email/password sign-up button */}
        <button className="submit-button" onClick={handleSignUp}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default SignUp;