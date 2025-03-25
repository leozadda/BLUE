import React from 'react';
import { User } from '../../User';
import { authFetch } from '../../../../../auth/token/authFetch';
import './BillingTab.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Props for the BillingTab component.
 */
interface BillingTabProps {
  user: User;                              // User data with subscription info and settings
  onSubscriptionUpgrade: () => void;       // Handler for subscription upgrade
}

/**
 * BillingTab component displays the user's current subscription plan and provides options to upgrade or cancel.
 * 
 * IMPORTANT: If user.subscription is undefined, a fallback default object is used to avoid runtime errors.
 */
const BillingTab: React.FC<BillingTabProps> = ({ user, onSubscriptionUpgrade }) => {
  // Provide a fallback subscription if none exists in the user object.
  const subscription = user.subscription || { plan: 'free', status: 'inactive' };

  // Debug: Log the user object and subscription
 
 

  // Helper function to capitalize the first letter of a string.
  const formatPlanName = (plan: string): string => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  // Format a given date string into a human-readable format.
  const formatDate = (dateString: string): string => {
    // Debug: Log the date string being formatted
   
    
    if (!dateString) {
     
      return 'Unknown date';
    }
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  /**
   * Handler for cancelling the subscription.
   * This function makes an API call to cancel the user's subscription and logs the process for debugging.
   */
  const handleCancelSubscription = async () => {
   
    
    try {
      // Get the authentication token from local storage
      const token = localStorage.getItem('token');
     
      
      // Make API call to cancel subscription using the authenticated fetch method.
      // NOTE: The URL needs to match exactly what's in server.js - we're using the exact route path
      const response = await authFetch(`${API_BASE_URL}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // No need to include body if we're just identifying the user from the token
      });

     
     
      
      if (response.ok) {
        // Try to parse the response as JSON to get any data from the server
        try {
          const responseData = await response.json();
         
        } catch (e) {
         
        }
        
       
        // Notify the user that the cancellation was successful.
        alert('Your subscription has been cancelled. You will have access until the end of your current billing period.');
      } else {
        // Try to get error details from the response
        try {
          const errorData = await response.json();
          console.error('Server error details:', errorData);
        } catch (e) {
          console.error('No error details available');
        }
        
        console.error('Failed to cancel subscription with status:', response.status);
        alert('Failed to cancel subscription. Please try again later.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error cancelling subscription:', error);
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
      } else {
        console.error('An unexpected error occurred:', error);
      }
      
      alert('An unexpected error occurred while cancelling your subscription.');
    }
    
  };

  // SIMPLIFIED LOGIC: Check if the user is a premium user
  // Using premiumStatus (as shown in the logs) instead of premium_status
  const isPremiumUser = !!user.premiumStatus;
 

  // SIMPLIFIED LOGIC: Check if user is in free trial only if they're not premium
  // This assumes if they're not premium, they must be in trial
  const isInFreeTrial = !isPremiumUser;
 



  return (
    <section className="settings-section billing-section">
      <h2>Payment</h2>
      
      <div className="setting-item">
        <div className="setting-info">
          <h3>Current Plan</h3>
          
          {/* SIMPLIFIED DISPLAY: Show plan type with end date on the same line */}
          {isPremiumUser && (
            <p>Premium</p>
          )}
          
          {isInFreeTrial && (
            <p>Free Trial</p>
          )}
        </div>
        
        {/* Show upgrade button for free trial users only */}

        {/* Show cancel button only for premium users */}
        {isPremiumUser && (
          <button 
            className="danger-button" 
            onClick={handleCancelSubscription}
            aria-label="Cancel subscription"
          >
            CANCEL
          </button>
        )}
      </div>
    </section>
  );
};

export default BillingTab;