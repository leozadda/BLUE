import React, { useState, useEffect } from 'react';
import { Minus, Plus, } from 'lucide-react';
import './DayPlanner.css';

// Type definitions for our data structures
interface Exercise {
  name: string;
  muscles: Record<string, number>;  // Maps muscle names to their involvement ratio (0-1)
}

interface SetType {
  name: string;
  icon: string;  // Visual representation of the set type
}

interface WorkoutSet {
  exercise: Exercise;
  weights: Record<string, number>;  // Maps weight values to their count
  reps: number;
  timer: number;  // Rest time in seconds
  setType: string;
}

interface WeightPlateProps {
  weight: number;
  count: number;
  onAdd: () => void;
  onRemove: () => void;
}

interface DayPlannerProps {
  date: Date;
}

// Static data for exercises and set types
const exerciseDatabase: Exercise[] = [
  { name: 'Bench Press', muscles: { chest: 0.8, triceps: 0.3, shoulders: 0.2 } },
  { name: 'Squat', muscles: { quads: 0.8, glutes: 0.6, hamstrings: 0.5 } },
];

const setTypes: Record<string, SetType> = {
  normal: { name: 'Normal', icon: '█ █ █' },
  pyramid: { name: 'Pyramid', icon: '▁ █ ▁' },
  dropSet: { name: 'Drop Set', icon: '█ ▄ ▃' },
};

// Component for individual weight plate display and interaction
const WeightPlate: React.FC<WeightPlateProps> = ({ weight, count, onAdd, onRemove }) => (
  <div 
    className={`weight-plate weight-${weight}`}
    onClick={onAdd}
    onContextMenu={(e) => {
      e.preventDefault();
      onRemove();
    }}
  >
    <span>{weight}</span>
    {count > 0 && <span className="weight-count">{count}</span>}
  </div>
);

// Main DayPlanner component
const DayPlanner: React.FC<DayPlannerProps> = ({ date }) => {

  // State management for all workout data
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [reps, setReps] = useState(8);
  const [timer, setTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [setType, setSetType] = useState('normal');

  // Default values for reset functionality
  const DEFAULT_REPS = 8;
  const DEFAULT_TIMER = 30;
  const DEFAULT_SET_TYPE = 'normal';

  // Function to format date in a readable way
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Function to handle resetting the current exercise setup
  const handleReset = () => {
    // Reset all values to their defaults
    setWeights({});  // Clear all selected weights
    setReps(DEFAULT_REPS);  // Reset reps to default
    setTimer(DEFAULT_TIMER);  // Reset timer to default
    setSetType(DEFAULT_SET_TYPE);  // Reset set type to default
    // Note: We don't reset selectedExercise so user can quickly add another set
  };

  // Function to delete a specific set
  const handleDeleteSet = (indexToDelete: number) => {
    setSets(prevSets => prevSets.filter((_, index) => index !== indexToDelete));
  };

  // Calculate total weight including bar (45 lbs) and plates
  const calculateTotalWeight = (weightObj: Record<string, number> = weights) => {
    let totalWeight = 45;  // Starting with bar weight
    
    // Add up all plate weights (multiplied by 2 for both sides)
    Object.entries(weightObj).forEach(([weight, count]) => {
      totalWeight += Number(weight) * count * 2;
    });
    
    return totalWeight;
  };

  // Functions to handle weight plate additions/removals
  const handleAddWeight = (weight: number) => {
    setWeights(prev => ({
      ...prev,
      [weight]: (prev[weight] || 0) + 1
    }));
  };

  const handleRemoveWeight = (weight: number) => {
    setWeights(prev => {
      if (!prev[weight] || prev[weight] <= 0) return prev;
      return {
        ...prev,
        [weight]: prev[weight] - 1
      };
    });
  };

  // Calculate total rest time for all sets
  const calculateTotalTime = () => {
    const previousSetsTime = sets.reduce((total, set) => total + set.timer, 0);
    return selectedExercise ? previousSetsTime + timer : previousSetsTime;
  };

  // Timer control functions
  const handleAddTime = () => {
    setTimer(prevTimer => Math.min(prevTimer + 15, 300));  // Cap at 5 minutes
  };

  const handleRemoveTime = () => {
    setTimer(prevTimer => Math.max(prevTimer - 15, 0));  // Minimum 0 seconds
  };

  // Function to add a new set to the workout
  const handleAddSet = () => {
    if (selectedExercise) {
      setSets(prev => [...prev, {
        exercise: selectedExercise,
        weights: { ...weights },
        reps,
        timer,
        setType
      }]);
      // Reset values after adding set
      handleReset();
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsTimerRunning(false);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, timer]);

  // Rest of the component JSX remains exactly the same...
  return (
    <div className="workout-day">
      <h2>{formatDate(date)}</h2>
      
      <div className="exercise-search">
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="exercise-list">
          {exerciseDatabase
            .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(exercise => (
              <div 
                key={exercise.name}
                className="exercise-item"
                onClick={() => setSelectedExercise(exercise)}
              >
                <div className='exercise-name'>{exercise.name}</div>
                <div className="muscle-ratios">
                  {Object.entries(exercise.muscles).map(([muscle, ratio]) => (
                    <div key={muscle}>
                      {muscle}: {(ratio * 100).toFixed(0)}%
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
      

      {selectedExercise && (
        <div className="set-builder">
          <div className="set-type-selector">
            {Object.entries(setTypes).map(([type, info]) => (
              <button
                key={type}
                className={`set-type-btn ${setType === type ? 'active' : ''}`}
                onClick={() => setSetType(type)}
              >
                <div className='set-icon'>{info.icon}</div>
                <div className='set-name'>{info.name}</div>
              </button>
            ))}
          </div>

          <div className="weight-total">
            <div className='weight-total-label'>
              <label className='weight'>Total Weight:</label>
              <label className='weight-number'>{calculateTotalWeight()}</label>
            </div>
          </div>

          <div className="weight-plates">
            {[45, 35, 25, 10, 5].map(weight => (
              <WeightPlate
                key={weight}
                weight={weight}
                count={weights[weight] || 0}
                onAdd={() => handleAddWeight(weight)}
                onRemove={() => handleRemoveWeight(weight)}
              />
            ))}
          </div>

          <div className="reps-slider">
            <div className='reps-label'>
              <label className='reps'>Reps:</label>
              <label className='reps-number'>{reps}</label>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
            />
          </div>

          <div className="timer-total">
            <div className='timer-total-label'>
              <label className='time-label'>Total Time:</label>
              <label className='time-number'>{calculateTotalTime()}s</label>
            </div>
          </div>

          <div className="timer-control">
            <button onClick={handleRemoveTime}>
              <label className='subtract-time'>-15s</label>
            </button>
            <button onClick={handleAddTime}>
              <label className='add-time'>+15s</label>
            </button>
          </div>

          <div className='add-set-grid'>
            <button className="reset-set-btn" onClick={handleReset}>
              Reset
            </button>
            <button className="add-set-btn" onClick={handleAddSet}>
              Add
            </button>
          </div>
        </div>
      )}

      <div className="sets-list">
        {sets.map((set, index) => (
          <div key={index} className="set-item">
            <h3 className="set-exercise-name">{set.exercise.name}</h3>
            <div className="set-type-name">{setTypes[set.setType].name}</div>
            <div className="set-type-icon">{setTypes[set.setType].icon}</div>
            
            <div className="set-stats-container">
              <div className="set-weight-container">
                <div className="set-weight-label">Weight:</div>
                <div className="set-weight-value">{calculateTotalWeight(set.weights)} lbs</div>
              </div>
              
              <div className="set-reps-container">
                <div className="set-reps-label">Reps:</div>
                <div className="set-reps-value">{set.reps}</div>
              </div>
              
              <div className="set-rest-container">
                <div className="set-rest-label">Rest:</div>
                <div className="set-rest-value">{set.timer} s</div>
              </div>
            </div>
            
            <div className="set-delete">
              <button className="set-delete-button" onClick={() => handleDeleteSet(index)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayPlanner;