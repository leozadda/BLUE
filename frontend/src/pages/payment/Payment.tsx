import React from 'react';
import StripePaymentForm from './stripe-form/StripePaymentForm';
import './Payment.css';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();
  
  const handlePaymentSuccess = () => {
    navigate('/dashboard/settings');
  };
  
  return (
    <div className="Payment">
        <div className="Payment-Container">
            <h1 className="Payment-Title">Free Trial Expired</h1>
            <p  className="Payment-Sub-Title">$20 every month to continue using our service.</p>
            <div className="Stripe-Form">
                <StripePaymentForm 
                    onSuccess={handlePaymentSuccess} 
                    onCancel={() => navigate('/')} 
                />
            </div>
        </div>
    </div>
  );
};

export default Payment;