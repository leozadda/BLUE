// User.ts - Defines what a user looks like in our app
export interface User {
  email: string;
  language: string;
  metric_system: boolean;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    price?: string;
    status: 'active' | 'cancelled';
    startDate?: string;
    nextBillingDate?: string;
  };
  premiumStatus: boolean;  // <-- Remove `?` to make it required
  trialStarted: boolean;
  newsletter: boolean;
  google_auth: boolean;
}


// This is our default user when the app starts
export const initialUser: User = {
  email: '\u00A0', // Non-breaking space
  language: 'English',
  metric_system: true, // Default to metric
  subscription: {
    plan: 'free',
    status: 'active'
  },
  premiumStatus: false,
  trialStarted: false,
  newsletter: false,
  google_auth: false
};