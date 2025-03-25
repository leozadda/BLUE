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
  onEditRatios: () => void;
  onCreateSet: () => void;
  onCreateExercise: () => void;
}

/**
 * WorkoutTab component displays workout configuration options
 * such as body part ratios, workout sets, and custom exercises.
 */
const WorkoutTab: React.FC<WorkoutTabProps> = ({
  user,
  onUnitsChange,
  onEditRatios,
  onCreateSet,
  onCreateExercise

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

      <div className="setting-item">
        <div className="setting-info">
          <h3>Recovery rates</h3>
          <p>Update muscle recovery ratios</p>
        </div>
        <button 
          className="action-button" 
          onClick={onEditRatios}
          aria-label="Change raios"
        >
          Update
        </button>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h3>Add a set</h3>
          <p>Make a set to reuse</p>
        </div>
        <button 
          className="action-button" 
          onClick={onCreateSet}
          aria-label="Create set"
        >
          ADD
        </button>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h3>Add exercise</h3>
          <p>Make your own exercise</p>
        </div>
        <button 
          className="action-button" 
          onClick={onCreateExercise}
          aria-label="Create exercise"
        >
          ADD
        </button>
      </div>


    </section>
  );
};

export default WorkoutTab;