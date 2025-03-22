import React from 'react';
import './WorkoutTab.css';



interface ExtendedUser {
  metric_system: boolean;
}

/**
 * Props for the WorkoutTab component
 */
interface WorkoutTabProps {
  user: ExtendedUser;
  onUnitsChange: () => void;     // Handler for when the user wants to change the unit system.
}

/**
 * WorkoutTab component displays workout configuration options
 * such as body part ratios, workout sets, and custom exercises.
 */
const WorkoutTab: React.FC<WorkoutTabProps> = ({
  user,
  onUnitsChange
}) => {
  return (
    <section className="settings-section workout-section">
      <h2>Lifts</h2>

      {/* Units Section */}
      <div className="setting-item">
        <div className="setting-info">
          <h3>Units</h3>
          <p>{user.metric_system ? 'Metric' : 'Imperial'}</p>
        </div>
        <button 
          className="action-button" 
          onClick={onUnitsChange}
          aria-label="Change units"
        >
          Update
        </button>
      </div>

    </section>
  );
};

export default WorkoutTab;