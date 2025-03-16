// User.ts - Defines what a user looks like in our app
export interface User {
  email: string;
  language: string;
  // Added units preference - can be either 'metric' or 'imperial'
  units: 'metric' | 'imperial';
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled';
  };
}

// This is our default user when the app starts
export const initialUser: User = {
  email: '\u00A0', // Non-breaking space
  language: 'English',
  units: 'metric',
  subscription: {
    plan: 'free',
    status: 'active'
  }
};
