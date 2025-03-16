/**
 * Defines the User interface and provides a default user object.
 * This file centralizes user-related type definitions for the application.
 */

export interface User {
    email: string;
    language: string;
    subscription: {
      plan: 'free' | 'pro' | 'enterprise';
      status: 'active' | 'cancelled';
    };
  }
  
  // Default user data for initial state
  export const initialUser: User = {
    email: 'user@example.com',
    language: 'English',
    subscription: {
      plan: 'free',
      status: 'active'
    }
  };