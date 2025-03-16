import React, { useState } from 'react';
import './Settings.css';
import { PersonStanding, CircleDollarSign, NotebookPen } from 'lucide-react';
import { User, initialUser } from './User';
import Popup from '../components/pop-up/PopUp';
import AccountTab from '../components/account/AccountTab';
import BillingTab from '../components/billing/BillingTab';
import WorkoutTab from '../components/workout/WorkoutTab';

/**
 * Main Settings component that manages the overall settings page,
 * including tab navigation and popup handling.
 */
export const Settings: React.FC = () => {
  // State for active tab selection
  const [activeTab, setActiveTab] = useState<'account' | 'billing' | 'workout'>('account');
  
  // User state (using the initialUser as default)
  const [user] = useState<User>(initialUser);
  
  // Popup state for dynamic content
  const [popup, setPopup] = useState<{ 
    isOpen: boolean; 
    title: string; 
    content: React.ReactNode 
  }>({
    isOpen: false,
    title: '',
    content: null
  });

  /**
   * Opens a popup with the specified title and content
   */
  const openPopup = (title: string, content: React.ReactNode) => {
    setPopup({ isOpen: true, title, content });
  };

  /**
   * Closes the currently open popup
   */
  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  // ===== Account Actions =====
  
  /**
   * Handles the email change action by opening a popup with the email form
   */
  const handleEmailChange = () => {
    openPopup('Change Email', (
      <div>
        <p>Current email: {user.email}</p>
        <input 
          type="email" 
          placeholder="New email address" 
          className="popup-input" 
          aria-label="New email address"
        />
        <div className="popup-actions">
          <button className="action-button" onClick={closePopup}>Save</button>
          <button className="cancel-button" onClick={closePopup}>Cancel</button>
        </div>
      </div>
    ));
  };

  /**
   * Handles the password change action by opening a popup with the password form
   */
  const handlePasswordChange = () => {
    openPopup('Change Password', (
      <div>
        <input 
          type="password" 
          placeholder="Current password" 
          className="popup-input" 
          aria-label="Current password"
        />
        <input 
          type="password" 
          placeholder="New password" 
          className="popup-input" 
          aria-label="New password"
        />
        <input 
          type="password" 
          placeholder="Confirm new password" 
          className="popup-input" 
          aria-label="Confirm new password"
        />
        <div className="popup-actions">
          <button className="action-button" onClick={closePopup}>Update Password</button>
          <button className="cancel-button" onClick={closePopup}>Cancel</button>
        </div>
      </div>
    ));
  };

  /**
   * Handles the logout action by opening a confirmation popup
   */
  const handleLogout = () => {
    openPopup('Sign Out', (
      <div>
        <p>Are you sure you want to sign out?</p>
        <div className="popup-actions">
          <button className="danger-button" onClick={closePopup}>Sign Out</button>
          <button className="cancel-button" onClick={closePopup}>Cancel</button>
        </div>
      </div>
    ));
  };

  // ===== Billing Actions =====
  
  /**
   * Handles the subscription upgrade action by opening a plan selection popup
   */
  const handleSubscriptionUpgrade = () => {
    openPopup('Upgrade Plan', (
      <div>
        <p>Current plan: {user.subscription.plan}</p>
        <div className="plan-options">
          <div className="plan-card">
            <h3>Pro</h3>
            <p>$9.99/month</p>
            <ul>
              <li>Custom workouts</li>
              <li>Advanced tracking</li>
              <li>No ads</li>
            </ul>
          </div>
          <div className="plan-card">
            <h3>Enterprise</h3>
            <p>$29.99/month</p>
            <ul>
              <li>Team management</li>
              <li>API access</li>
              <li>Priority support</li>
            </ul>
          </div>
        </div>
        <div className="popup-actions">
          <button className="action-button" onClick={closePopup}>Select Plan</button>
          <button className="cancel-button" onClick={closePopup}>Cancel</button>
        </div>
      </div>
    ));
  };

  // ===== Workout Actions =====
  
  /**
   * Handles the body part ratio editing action by opening the ratio slider popup
   */
  const handleEditRatios = () => {
    openPopup('Body Part Ratios', (
      <div>
        <div className="ratio-slider">
          <label>Arms: 30%</label>
          <input type="range" min="0" max="100" defaultValue="30" aria-label="Arm focus percentage" />
        </div>
        <div className="ratio-slider">
          <label>Legs: 30%</label>
          <input type="range" min="0" max="100" defaultValue="30" aria-label="Leg focus percentage" />
        </div>
        <div className="ratio-slider">
          <label>Core: 20%</label>
          <input type="range" min="0" max="100" defaultValue="20" aria-label="Core focus percentage" />
        </div>
        <div className="ratio-slider">
          <label>Back: 20%</label>
          <input type="range" min="0" max="100" defaultValue="20" aria-label="Back focus percentage" />
        </div>
        <div className="popup-actions">
          <button className="action-button" onClick={closePopup}>Save Ratios</button>
          <button className="cancel-button" onClick={closePopup}>Cancel</button>
        </div>
      </div>
    ));
  };

  /**
   * Handles the workout set creation action by opening the set creation form
   */
  const handleCreateSet = () => {
    openPopup('Create Workout Set', (
      <div>
        <input 
          type="text" 
          placeholder="Set name" 
          className="popup-input" 
          aria-label="Workout set name"
        />
        <select className="popup-input" aria-label="Exercise type">
          <option value="">Select exercise type</option>
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
          <option value="flexibility">Flexibility</option>
        </select>
        <textarea 
          className="popup-input" 
          placeholder="Notes" 
          rows={3}
          aria-label="Workout notes"
        ></textarea>
        <div className="popup-actions">
          <button className="action-button" onClick={closePopup}>Create Set</button>
          <button className="cancel-button" onClick={closePopup}>Cancel</button>
        </div>
      </div>
    ));
  };

  /**
   * Handles the exercise creation action by opening the exercise creation form
   */
  const handleCreateExercise = () => {
    openPopup('Add Exercise', (
      <div>
        <input 
          type="text" 
          placeholder="Exercise name" 
          className="popup-input" 
          aria-label="Exercise name"
        />
        <select className="popup-input" aria-label="Target body area">
          <option value="">Select target area</option>
          <option value="arms">Arms</option>
          <option value="legs">Legs</option>
          <option value="core">Core</option>
          <option value="back">Back</option>
        </select>
        <textarea 
          className="popup-input" 
          placeholder="Instructions" 
          rows={3}
          aria-label="Exercise instructions"
        ></textarea>
        <div className="popup-actions">
          <button className="action-button" onClick={closePopup}>Add Exercise</button>
          <button className="cancel-button" onClick={closePopup}>Cancel</button>
        </div>
      </div>
    ));
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        {/* Tab Navigation */}
        <nav className="settings-tabs" aria-label="Settings navigation">
          <button
            className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
            aria-selected={activeTab === 'account'}
            role="tab"
          >
            <PersonStanding size={20} />
            <span>Account</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
            aria-selected={activeTab === 'billing'}
            role="tab"
          >
            <CircleDollarSign size={20} />
            <span>Billing</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'workout' ? 'active' : ''}`}
            onClick={() => setActiveTab('workout')}
            aria-selected={activeTab === 'workout'}
            role="tab"
          >
            <NotebookPen size={20} />
            <span>Workout</span>
          </button>
        </nav>

        {/* Tab Content Area */}
        <div role="tabpanel" aria-label={`${activeTab} settings`}>
          {/* Render active tab */}
          {activeTab === 'account' && (
            <AccountTab
              user={user}
              onEmailChange={handleEmailChange}
              onPasswordChange={handlePasswordChange}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'billing' && (
            <BillingTab
              user={user}
              onSubscriptionUpgrade={handleSubscriptionUpgrade}
            />
          )}

          {activeTab === 'workout' && (
            <WorkoutTab
              onEditRatios={handleEditRatios}
              onCreateSet={handleCreateSet}
              onCreateExercise={handleCreateExercise}
            />
          )}
        </div>

        {/* Popup Component (conditionally rendered) */}
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

export default Settings;