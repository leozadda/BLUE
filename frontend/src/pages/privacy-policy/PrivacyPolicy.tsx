import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

export const PrivacyPolicy: React.FC = () => {

  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <h1 className="privacy-title">Privacy Policy</h1>

        <div className="privacy-section">
          <h2 className="privacy-section-title">1. Information We Collect</h2>
          <p className="privacy-text">
            We collect information that you provide directly to us, including but not limited to your name, email address, and any other information you choose to provide when using our services.
          </p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-section-title">2. How We Use Your Information</h2>
          <p className="privacy-text">
            We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to develop new services. We may also use the information to protect the rights and property of b-lu-e.com and others.
          </p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-section-title">3. Information Sharing</h2>
          <p className="privacy-text">
            We do not share your personal information with third parties except as described in this privacy policy. We may share your information with service providers who assist us in providing our services, when required by law, or to protect rights and safety.
          </p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-section-title">4. Data Security</h2>
          <p className="privacy-text">
            We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable and we cannot guarantee the security of our systems 100%.
          </p>
        </div>

        <div className="privacy-button-container">
        <Link to="/"><button className="privacy-exit-button">Exit</button></Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;