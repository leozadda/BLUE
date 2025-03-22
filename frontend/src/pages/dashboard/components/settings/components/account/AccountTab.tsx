import React from 'react';
import './AccountTab.css';

/**
 * Extended user interface.
 * - google_auth: true means the user signed in with Google.
 */
interface ExtendedUser {
  email: string;
  premiumStatus: boolean;
  trialStarted: boolean;
  metric_system: boolean;
  newsletter: boolean;
  google_auth: boolean;
}

/**
 * Props for the AccountTab component.
 * The parent Settings component passes in the user object along with handler functions.
 */
interface AccountTabProps {
  user: ExtendedUser;
  onEmailChange: () => void;     // Handler for when the user wants to change their email.
  onPasswordChange: () => void;  // Handler for when the user wants to change their password.
  onUnitsChange: () => void;     // Handler for when the user wants to change the unit system.
  onLogout: () => void;          // Handler for logging out.
}

/**
 * AccountTab component displays the user's account details and actions.
 * IMPORTANT: If the user signed in via Google (google_auth === true), the email and password change options are hidden.
 */
const AccountTab: React.FC<AccountTabProps> = ({
  user,
  onEmailChange,
  onPasswordChange,
  onUnitsChange,
  onLogout
}) => {
  return (
    <section className="settings-section account-section">
      <h2>User</h2>
      
      {/* Email Section */}
      <div className="setting-item">
        <div className="setting-info">
          <h3>Email</h3>
          <p>{user.email}</p>
        </div>
        {/* Only show the Change button if the user did NOT sign in with Google */}
        {!user.google_auth && (
          <button 
            className="action-button" 
            onClick={onEmailChange}
            aria-label="Change email"
          >
            Update
          </button>
        )}
      </div>

      {/* Password Section */}
      <div className="setting-item">
        <div className="setting-info">
          <h3>Password</h3>
          <p>••••••••</p>
        </div>
        {/* Only show the Change button if the user did NOT sign in with Google */}
        {!user.google_auth && (
          <button 
            className="action-button" 
            onClick={onPasswordChange}
            aria-label="Change password"
          >
            Update
          </button>
        )}
      </div>

      {/* Sign Out Section */}
      <div className="setting-item">
        <div className="setting-info">
          <h3>Sign Out</h3>
          <p>End your session</p>
        </div>
        <button 
          className="danger-button" 
          onClick={onLogout}
          aria-label="Sign out"
        >
          Sign Out
        </button>
      </div>
    </section>
  );
};

export default AccountTab;
