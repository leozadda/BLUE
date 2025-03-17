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
const logDebug = (message: string, data?: any) => {
  console.log(`[STRIPE PAYMENT] ${message}`, data || '');
};

// Load Stripe with your public key
const stripePromise = loadStripe(STRIPE_KEY);

// Define types for the props
interface StripeCheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Inner form component for handling payments
const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({ clientSecret, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // This function is called when the user submits the payment form.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Payment form submitted");
    
    if (!stripe || !elements) {
      console.error("Stripe.js hasn't loaded yet or elements are not available");
      return;
    }

    setIsLoading(true);
    try {
      // MAIN CHANGE:
      // Previously we used confirmSetup, but since our clientSecret comes from a PaymentIntent,
      // we need to use confirmPayment instead.
      console.log("Attempting to confirm payment with Stripe");
      const result = await stripe.confirmPayment({
        elements, // This binds the PaymentElement to the payment confirmation.
        confirmParams: { 
          // This URL will be used for redirect if needed after payment confirmation.
          return_url: `${window.location.origin}/dashboard/settings` 
        },
        redirect: 'if_required' as const, // This setting handles both redirect and non-redirect flows.
      });
      
      console.log("Payment result received:", result);
      
      if (result.error) {
        // If there's an error during payment confirmation, log and display it.
        console.error("Payment error:", result.error.message);
        setMessage(result.error.message || "Payment failed");
      } else if (result.paymentIntent) {
        // A PaymentIntent is returned upon a successful payment confirmation.
        console.log("Payment intent status:", result.paymentIntent.status);
        
        // Check if payment succeeded. Only if status is 'succeeded' do we consider it a complete charge.
        if (result.paymentIntent.status === 'succeeded') {
          console.log("Payment succeeded, calling onSuccess callback");
          if (onSuccess) onSuccess();
        } else {
          console.warn(`Payment not completed. Status: ${result.paymentIntent.status}`);
          setMessage(`Payment ${result.paymentIntent.status}. Please try again.`);
        }
      }
    } catch (err) {
      console.error("Unexpected error during payment:", err);
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

// Interface for the main component props
interface StripePaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Main component that initializes Stripe and fetches the client secret from your backend
const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ onSuccess, onCancel }) => {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Custom appearance settings for the Stripe Elements UI
  const appearance = {
    theme: 'night' as const, // Using "as const" to specify this is one of the allowed theme values
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
      console.log("Fetching client secret from API");
      setLoading(true);
      
      // Retrieve the auth token from localStorage for authentication
      const token = localStorage.getItem('token');

      if (!token) {
        console.error("No authentication token found");
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        console.log(`Making request to ${API_BASE_URL}/create-payment-intent`);
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
          console.error(`API error: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to initialize payment: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data from API", { hasClientSecret: !!data.clientSecret });
        
        if (!data.clientSecret) {
          console.error("Missing client secret in API response");
          throw new Error('Missing client secret');
        }

        // Set the retrieved client secret to state so it can be used by Stripe Elements
        setClientSecret(data.clientSecret);
        console.log("Client secret set successfully");
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error("Error fetching client secret:", errorMessage);
        setError(`Payment error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    fetchClientSecret();
  }, []);

  // Display loading or error states
  if (loading) {
    console.log("Stripe form is loading");
    return <div className="stripe-loading">Initializing payment form...</div>;
  }

  if (error) {
    console.error("Displaying error in Stripe form:", error);
    return <div className="stripe-error">{error}</div>;
  }

  // If we have a client secret, render the payment form
  return (
    <>
      {clientSecret ? (
        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
          <StripeCheckoutForm clientSecret={clientSecret} onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
      ) : (
        <div className="stripe-error">Unable to initialize payment system. Please try again later.</div>
      )}
    </>
  );
};

export default StripePaymentForm;