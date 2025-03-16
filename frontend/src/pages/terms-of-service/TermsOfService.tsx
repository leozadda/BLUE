import React from 'react';
import './TermsOfService.css';
import { Link } from 'react-router-dom';

export const TermsOfService: React.FC = () => {

  const handleAccept = () => {
    // Add acceptance logic here
    window.history.back();
};

const handleDecline = () => {
    window.history.back();
};

  return (
    <div className="service-container">
      <div className="service-content">
        <h1 className="service-title">Terms of Service</h1>

        <div className="service-section">
          <h2 className="section-title">1. Acceptance of Terms</h2>
          <p className="service-text">
            By accessing and using b-lu-e.com, you accept and agree to be bound by the terms and provisions of this agreement.
          </p>
        </div>

        <div className="service-section">
          <h2 className="service-section-title">2. Use License</h2>
          <p className="service-text">
            Permission is granted to temporarily download one copy of the materials (information or software) on b-lu-e.com for personal, non-commercial transitory viewing only.
          </p>
        </div>

        <div className="service-section">
          <h2 className="service-section-title">3. Disclaimer</h2>
          <p className="service-text">
            The materials on b-lu-e.com are provided on an 'as is' basis. b-lu-e.com makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </div>

        <div className="service-section">
          <h2 className="service-section-title">4. Limitations</h2>
          <p className="service-text">
            In no event shall b-lu-e.com or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on b-lu-e.com.
          </p>
        </div>

        <div className="service-button-container">
          <Link to="/"><button className="service-exit-button">Exit</button></Link>
        </div>
        
      </div>
    </div>
  );
};

export default TermsOfService;