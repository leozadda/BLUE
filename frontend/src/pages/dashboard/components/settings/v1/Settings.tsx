import React, { useState, useEffect } from 'react';
import './Settings.css';
import { PersonStanding, CircleDollarSign, Dumbbell } from 'lucide-react';
import { User, initialUser } from './User';
import Popup from '../components/pop-up/PopUp';
import AccountTab from '../components/account/AccountTab';
import WorkoutTab from '../components/workout/WorkoutTab';
import { authFetch } from '../../../../auth/token/authFetch';
import { useAuth } from '../../../../auth/auth-context/AuthContext';

// Add this interface right after the existing imports
interface UnitsSelectorProps {
  currentUnits: string;
  onSave: (newUnits: string) => void;
  onCancel: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Settings component manages account and billing settings.
 * It handles popup modals for email, password, units, and subscription updates.
 * IMPORTANT: It now fetches user information (including google_auth and metric_system) from the API so that AccountTab can correctly hide email/password options.
 */
export const Settings: React.FC = () => {
  // Active tab state: either 'account' or 'billing'
  const [activeTab, setActiveTab] = useState<'account' | 'billing' | 'workout'>('account');
  // User state holds current user data; updated after fetching from the API.
  const [user, setUser] = useState<User>(initialUser);
  // Popup state holds whether a popup is open and its title and content.
  const [popup, setPopup] = useState<{ 
    isOpen: boolean; 
    title: string; 
    content: React.ReactNode; 
  }>({
    isOpen: false,
    title: '',
    content: null
  });

  // Get the user info and logout function from AuthContext
  const { userInfo, userInfoLoading, refreshUserInfo, logout } = useAuth();


    // ------------------------------------------------------------------
    // Fetch the user's unit preference (metric or imperial) from the user info
    useEffect(() => {
       
        
        // Set the metricSystem state based on the user's preference
        if(userInfo) {
            setUser(userInfo);
        }
    }, [userInfo]); // This effect runs whenever userInfo changes

    // ------------------------------------------------------------------

  /**
   * Opens the popup modal with a given title and content.
   */
  const openPopup = (title: string, content: React.ReactNode) => {
   
    setPopup({ isOpen: true, title, content });
  };

  /**
   * Closes the popup modal.
   */
  const closePopup = () => {
   
    setPopup({ ...popup, isOpen: false });
  };

  /**
   * Handler for changing email.
   * Opens a popup with an input field for a new email address.
   * When "Save" is clicked, an API call is made.
   * The popup content is then replaced with a success or error message.
   */
  const handleEmailChange = () => {
    openPopup('Update Email', (
      <div>
        <input 
          type="email" 
          id="newEmail"
          placeholder="New email address" 
          className="popup-input" 
          aria-label="New email address"
        />
        <div className="popup-actions">
          <button 
            className="action-button" 
            onClick={async () => {
              try {
                const newEmail = (document.getElementById('newEmail') as HTMLInputElement).value;
               
                const response = await authFetch(`${API_BASE_URL}/update-email`, {
                  method: 'POST',
                  credentials: "include", // This ensures cookies are sent with the request.
                  body: JSON.stringify({ email: newEmail })
                });
                if (response.ok) {
                  // Update user state so that the new email is immediately visible
                 
                  setUser({ ...user, email: newEmail });
                  // Replace popup content with a success message
                  setPopup({
                    isOpen: true,
                    title: 'Success',
                    content: (
                      <div>
                        <p>Email updated</p>
                        <button className="action-button" onClick={closePopup}>OK</button>
                      </div>
                    )
                  });
                } else {
                  // If the API call fails, show an error message within the popup
                  console.error('❌ Settings: Error updating email');
                  setPopup({
                    isOpen: true,
                    title: 'Error',
                    content: (
                      <div>
                        <p>Error updating email. Please try again.</p>
                        <button className="action-button" onClick={closePopup}>OK</button>
                      </div>
                    )
                  });
                }
              } catch (error) {
                // Catch any unexpected errors and display an error message
                console.error('💥 Settings: Unexpected error updating email:', error);
                setPopup({
                  isOpen: true,
                  title: 'Error',
                  content: (
                    <div>
                      <p>An unexpected error occurred while updating email.</p>
                      <button className="action-button" onClick={closePopup}>OK</button>
                    </div>
                  )
                });
              }
            }}
          >
            Update
          </button>
          
        </div>
      </div>
    ));
  };

  /**
   * Handler for changing password.
   * Opens a popup with inputs for the current and new passwords.
   * When "Update" is clicked, an API call is made and the popup content updates with the outcome.
   */
  const handlePasswordChange = () => {
    openPopup('Update Password', (
      <div>
        <input 
          type="password" 
          id="currentPassword"
          placeholder="Current password" 
          className="popup-input" 
          aria-label="Current password"
        />
        <input 
          type="password" 
          id="newPassword"
          placeholder="New password" 
          className="popup-input" 
          aria-label="New password"
        />
        <div className="popup-actions">
          <button 
            className="action-button" 
            onClick={async () => {
              try {
                const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
               
                const response = await authFetch(`${API_BASE_URL}/update-password`, {
                  method: 'POST',
                  credentials: "include", // This ensures cookies are sent with the request.
                  body: JSON.stringify({ password: newPassword })
                });
                if (response.ok) {
                 
                  setPopup({
                    isOpen: true,
                    title: 'Success',
                    content: (
                      <div>
                        <p>Password updated</p>
                        <button className="action-button" onClick={closePopup}>OK</button>
                      </div>
                    )
                  });
                } else {
                  console.error('❌ Settings: Error updating password');
                  setPopup({
                    isOpen: true,
                    title: 'Error',
                    content: (
                      <div>
                        <p>Error updating password. Please try again.</p>
                        <button className="action-button" onClick={closePopup}>OK</button>
                      </div>
                    )
                  });
                }
              } catch (error) {
                console.error('💥 Settings: Unexpected error updating password:', error);
                setPopup({
                  isOpen: true,
                  title: 'Error',
                  content: (
                    <div>
                      <p>An unexpected error occurred while updating password.</p>
                      <button className="action-button" onClick={closePopup}>OK</button>
                    </div>
                  )
                });
              }
            }}
          >
            Update
          </button>

        </div>
      </div>
    ));
  };

/**
 * UnitsSelector component: lets the user choose between metric and imperial systems.
 * It accepts the current unit setting and callbacks for saving or canceling the change.
 */
const UnitsSelector: React.FC<UnitsSelectorProps> = ({ currentUnits, onSave, onCancel }) => {
  const [selectedUnits, setSelectedUnits] = useState(currentUnits);
  return (
    <div>
      <div className="units-options">
        <label className="units-option">
          <input
            type="radio"
            name="units"
            value="metric"
            checked={selectedUnits === 'metric'}
            onChange={() => setSelectedUnits('metric')}
          />
          <span>Centimeters, Meters, & Kilograms.</span>
        </label>
        <label className="units-option">
          <input
            type="radio"
            name="units"
            value="imperial"
            checked={selectedUnits === 'imperial'}
            onChange={() => setSelectedUnits('imperial')}
          />
          <span>Inches, Feet, & Pounds.</span>
        </label>
      </div>
      <div className="popup-actions">
        <button 
          className="action-button" 
          onClick={() => onSave(selectedUnits)}
        >
          Update
        </button>
      </div>
    </div>
  );
};

  /**
   * Handler for changing units.
   * Opens a popup with the UnitsSelector component.
   * After the API call, updates the popup with a success or error message.
   * IMPORTANT: We now use the database field `metric_system` to determine the current units.
   */
  const handleUnitsChange = () => {
    openPopup('Update Units', 
      <UnitsSelector 
        currentUnits={user.metric_system ? 'metric' : 'imperial'}
        onSave={async (newUnits) => {
          try {
            const response = await authFetch(`${API_BASE_URL}/update-units`, {
              method: 'POST',
              credentials: "include",
              body: JSON.stringify({ metric_system: newUnits === 'metric' })
            });
            if (response.ok) {
              // Update user state locally
              setUser({ ...user, metric_system: newUnits === 'metric' });
              
              // Add this line to refresh user info in the AuthContext
              await refreshUserInfo();
              
              setPopup({
                isOpen: true,
                title: 'Success',
                content: (
                  <div>
                    <p>Units updated successfully!</p>
                    <button className="action-button" onClick={closePopup}>OK</button>
                  </div>
                )
              });
            } else {
              console.error('❌ Settings: Error updating units');
              setPopup({
                isOpen: true,
                title: 'Error',
                content: (
                  <div>
                    <p>Error updating units. Please try again.</p>
                    <button className="action-button" onClick={closePopup}>OK</button>
                  </div>
                )
              });
            }
          } catch (error) {
            console.error('💥 Settings: Unexpected error updating units:', error);
            setPopup({
              isOpen: true,
              title: 'Error',
              content: (
                <div>
                  <p>An unexpected error occurred while updating units.</p>
                  <button className="action-button" onClick={closePopup}>OK</button>
                </div>
              )
            });
          }
        }}
        onCancel={closePopup}
      />
    );
  };

  /**
   * Handler for logging out.
   * Opens a confirmation popup; if confirmed, uses AuthContext logout method,
   * resets user state, and redirects to login.
   */
  const handleLogout = () => {
    openPopup('Sign Out', (
      <div>
        <p>Are you sure you want to sign out?</p>
        <div className="popup-actions">
          <button 
            className="danger-button" 
            onClick={async () => {
             
              try {
                // Use the logout function from AuthContext
               
                await logout();
                
                setUser(initialUser);
                window.location.href = '/login';
              } catch (error) {
                console.error('💥 Settings: Error during logout process:', error);
                // Even if there's an error, we'll still redirect to login
                window.location.href = '/login';
              } finally {
                closePopup();
              }
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        {/* Navigation Tabs */}
        <nav className="settings-tabs" aria-label="Settings navigation">

    {/* TAB FOR ACCOUNT SETTINGS */}
          <button
            className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
            aria-selected={activeTab === 'account'}
            role="tab"
          >
            <PersonStanding size={20} />
            <span>Account</span>
          </button>

      {/* TAB FOR BILLING SETTINGS */}
          <button
            className={`tab-button ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
            aria-selected={activeTab === 'billing'}
            role="tab"
          >
            <CircleDollarSign size={20} />
            <span>Billing</span>
          </button>

      {/* TAB FOR WORKOUT SETTINGS */}
          <button
            className={`tab-button ${activeTab === 'workout' ? 'active' : ''}`}
            onClick={() => setActiveTab('workout')}
            aria-selected={activeTab === 'workout'}
            role="tab"
          >
            <Dumbbell  size={20} />
            <span>Workout</span>
          </button>

        </nav>

        {/* Render Active Tab Content */}
        <div role="tabpanel" aria-label={`${activeTab} settings`}>
          {activeTab === 'account' && (
            <AccountTab 
              user={user} 
              onEmailChange={handleEmailChange} 
              onPasswordChange={handlePasswordChange} 
              onUnitsChange={handleUnitsChange}  // ✅ Add this line
              onLogout={handleLogout} 
            />

          )}

          {activeTab === 'workout' && (
            <WorkoutTab
              user={user}
              onUnitsChange={handleUnitsChange}
            />
          )}
        </div>

        {/* Render Popup Modal if Open */}
        {popup.isOpen && (
          <Popup
            title={popup.title}
            content={popup.content}
            onClose={closePopup}
          />
        )}
      </div>
    </div>
  );
};
