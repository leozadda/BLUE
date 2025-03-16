import React from 'react';
import { Link } from 'react-router-dom';
import './CustomerService.css';

export const CustomerService: React.FC = () => {
  const handleSendEmail = () => {
    window.location.href = 'mailto:help@b-lu-e.com';
  };


  return (
    <div className="customer-service-container">
      <div className="customer-service-content">
        <div className="contact-email">
          help@b-lu-e.com
        </div>
        <div className="contact-message">
          Got a question? We're here to help.
        </div>
        <div className="button-container">
          <button onClick={handleSendEmail} className="send-email-button">Send Email</button>
          <Link to="/"><button className="exit-button">Exit</button></Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerService;