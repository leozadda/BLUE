// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authFetch } from '../token/authFetch';

// Define the user info interface based on your API response
type UserInfo = {
  id: string;
  email: string;
  google_auth: boolean;
  created_at: string;
  premiumStatus: boolean;
  trialStarted: boolean;
  metric_system: boolean;
  newsletter: boolean;
  active: boolean;
  trial_period_ends_at: string | null;
  language: string;  // <-- Add missing properties
  subscription: any; // <-- Add subscription (set correct type if known)
};


// Define the shape of our auth context with added user info
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authChecked: boolean; // Flag to indicate if we've checked auth status
  userInfo: UserInfo | null; // Added user info
  userInfoLoading: boolean; // Flag to indicate if user info is loading
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  refreshUserInfo: () => Promise<void>; // Function to manually refresh user info
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  authChecked: false,
  userInfo: null, // Default user info is null
  userInfoLoading: false, // Not loading by default
  logout: async () => {},
  checkAuthStatus: async () => false,
  refreshUserInfo: async () => {} // Default refresh function
});

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // State for user info
  const [userInfoLoading, setUserInfoLoading] = useState<boolean>(false); // State for user info loading status

  // Function to fetch user info from the API
  const fetchUserInfo = async (): Promise<void> => {
   
    setUserInfoLoading(true);
    
    try {
      // Only proceed if user is authenticated
      if (!isAuthenticated) {
       
        setUserInfo(null);
        return;
      }
      
      // Fetch user info from your API endpoint
      const response = await authFetch(`${API_BASE_URL}/get-user-info`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
       
        setUserInfo(data);
      } else {
        console.error('❌ AuthContext: Failed to fetch user info', await response.text());
        // If we get 401 Unauthorized, we should log the user out
        if (response.status === 401) {
         
          setIsAuthenticated(false);
          setUserInfo(null);
        }
      }
    } catch (error) {
      console.error('💥 AuthContext: Error fetching user info', error);
      setUserInfo(null);
    } finally {
      setUserInfoLoading(false);
     
    }
  };

  // Public function to manually refresh user info from components
  const refreshUserInfo = async (): Promise<void> => {
   
    await fetchUserInfo();
  };

  // Function to check if the user is authenticated by validating the cookie
  const checkAuthStatus = async (): Promise<boolean> => {
   
    setIsLoading(true);
    
    try {
     
     
      
      // Send a request to the verify endpoint to check if cookie is valid
      const response = await authFetch(`${API_BASE_URL}/verify-auth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
       
        setIsAuthenticated(true);
        
        // Once we know user is authenticated, fetch their info
       
        await fetchUserInfo();
        
        return true;
      } else {
        setIsAuthenticated(false);
        setUserInfo(null); // Clear user info when not authenticated
        return false;
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setIsAuthenticated(false);
      setUserInfo(null); // Clear user info on error
      return false;
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
     
    }
  };

  // Function to log the user out
  const logout = async (): Promise<void> => {
   
    try {
      const response = await authFetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
       
      } else {
        console.warn('⚠️ AuthContext: Logout request failed');
      }
    } catch (error) {
      console.error('💥 AuthContext: Error during logout', error);
    } finally {
      // Even if the server request fails, we'll log out the user locally
      setIsAuthenticated(false);
      setUserInfo(null); // Clear user info on logout
    }
  };

  // Check auth status when the component mounts
  useEffect(() => {
   
    
    checkAuthStatus();
    
    // Cleanup function
    return () => {
     
    };
  }, []);

  // Refresh user info when authentication state changes
  useEffect(() => {
   
    
    if (isAuthenticated && !userInfoLoading && !userInfo) {
     
      fetchUserInfo();
    }
  }, [isAuthenticated]);

  // Provide the context value
  const value = {
    isAuthenticated,
    isLoading,
    authChecked,
    userInfo, // Provide user info to all components
    userInfoLoading, // Indicate if user info is currently loading
    logout,
    checkAuthStatus,
    refreshUserInfo // Allow components to manually refresh user info if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);