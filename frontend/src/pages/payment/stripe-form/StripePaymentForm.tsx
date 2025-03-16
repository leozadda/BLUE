import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './StripePaymentForm.css';
import { authFetch } from '../../auth/token/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const STRIPE_KEY = import.meta.env.VITE_STRIPE_KEY;

// Logger utility for debugging


// Load Stripe with your public key
const stripePromise = loadStripe(STRIPE_KEY);

// Inner form component for handling payments
const StripeCheckoutForm = ({ clientSecret, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // This function is called when the user submits the payment form.
  const handleSubmit = async (e) => {
    e.preventDefault();
    

    setIsLoading(true);
    try {
      // MAIN CHANGE:
      // Previously we used confirmSetup, but since our clientSecret comes from a PaymentIntent,
      // we need to use confirmPayment instead.
   
      const result = await stripe.confirmPayment({
        elements, // This binds the PaymentElement to the payment confirmation.
        confirmParams: { 
          // This URL will be used for redirect if needed after payment confirmation.
          return_url: `${window.location.origin}/dashboard/settings` 
        },
        redirect: 'if_required', // This setting handles both redirect and non-redirect flows.
      });
      

      
      if (result.error) {
        // If there's an error during payment confirmation, log and display it.
        setMessage(result.error.message);
      } else if (result.paymentIntent) {
        // A PaymentIntent is returned upon a successful payment confirmation.
        
        // Check if payment succeeded. Only if status is 'succeeded' do we consider it a complete charge.
        if (result.paymentIntent.status === 'succeeded') {
          if (onSuccess) onSuccess();
        } else {

          setMessage(`Payment ${result.paymentIntent.status}. Please try again.`);
        }
      }
    } catch (err) {

      setMessage('An unexpected error occurred.');
    } finally {
      // Reset the loading state once the process is complete.
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      {/* PaymentElement is a pre-built UI component provided by Stripe for capturing payment details */}
      <PaymentElement />
      <div className="stripe-form-buttons">
        <button className="action-button" disabled={isLoading || !stripe || !elements}>
          {isLoading ? 'Processing...' : 'SUBMIT'}
        </button>
      </div>
      {/* Display any error messages to the user */}
      {message && <div className="stripe-error-message">{message}</div>}
    </form>
  );
};

// Main component that initializes Stripe and fetches the client secret from your backend
const StripePaymentForm = ({ onSuccess, onCancel }) => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Custom appearance settings for the Stripe Elements UI
  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#0000ff',
      colorBackground: '#0000ff',
      colorText: '#ffffff',
      colorDanger: '#ffffff',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      spacingUnit: '8px',
      spacingGridRow: '20px',
      spacingTab: '8px',
      spacingAccordionItem: '8px',
    },
    rules: {
      '.Input': {
        backgroundColor: 'transparent',
        borderColor: '#ffffff',
        padding: 'var(--spacingUnit)',
        width: '100% !important'
      },
      '.Label': {
        color: '#ffffff',
        width: '100% !important'
      },
      '.Tab': {
        width: '100% !important'
      },
      '.TabMore': {
        width: '100% !important'
      },
      '.TabPanel': {
        width: '100% !important'
      },
      '.Element': {
        width: '100% !important',
        maxWidth: '100% !important'
      },
      '.ElementsApp': {
        width: '100% !important',
        maxWidth: '100% !important'
      }
    }
  };

  // useEffect hook to fetch the client secret when the component mounts.
  useEffect(() => {
    const fetchClientSecret = async () => {
      setLoading(true);
      
      // Retrieve the auth token from localStorage for authentication
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      try {

        // Make an authenticated POST request to your backend to create a PaymentIntent
        const response = await authFetch(`${API_BASE_URL}/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({})
        });

        if (!response.ok) {

          throw new Error(`Failed to initialize payment: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.clientSecret) throw new Error('Missing client secret');

        // Set the retrieved client secret to state so it can be used by Stripe Elements
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(`Payment error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchClientSecret();
  }, []);



  return (
    <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
      <StripeCheckoutForm clientSecret={clientSecret} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
};

export default StripePaymentForm;
