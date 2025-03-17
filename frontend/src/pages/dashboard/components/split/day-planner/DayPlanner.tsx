import React, { useState, useEffect } from 'react';
import { ReactNode } from "react";
import { Dumbbell, ArrowDownCircle, Plus, Layers, Triangle, Pause, CircleDot, CornerDownLeft, Zap, Timer } from "lucide-react";
import './DayPlanner.css';
import { authFetch } from '../../../../auth/token/authFetch';
import { useAuth } from '../../../../auth/auth-context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// =================================================================================
// API & Component Type Definitions
// =================================================================================

// API Types: These define the shape of the data we get from our server API calls.

// Represents a workout set template coming from the API.
interface SetTemplate {
  id: number;
  set_type_name: string;
  phase_number: number;
  rep_range_min: number;
  rep_range_max: number;
  weight_modifier: number;
  target_rest_period_seconds: number;
}

// Represents the response for an exercise retrieved from the API.
interface ExerciseResponse {
  id: number;
  name: string;
  equipment: string;
  muscleTargets: Array<{
    muscle: string;
    percentage: number;
  }>;
}

// Represents the user information retrieved from the API.
interface UserInfo {
  id: number;
  email: string;
  premiumStatus: boolean;
  trialStarted: Date;
  metric_system: boolean;
  newsletter: boolean;
  google_auth: boolean;
}

// Component Types: These types define the structure of the data used inside our component.

// Represents an exercise used in our DayPlanner.
interface Exercise {
  id: number;
  name: string;
  muscleTargets: Array<{
    muscle: string;
    percentage: number;
  }>;
}

// Represents a workout set that the user creates.
interface WorkoutSet {
  id?: number;
  exercise: {
    id: number;
    name: string;
    muscleTargets: Array<{
      muscle: string;
      percentage: number;
    }>;
  };
  weights: Record<string, number>;
  reps: number;
  timer: number;
  setType: string;
}

// Props for the WeightPlate component.
interface WeightPlateProps {
  weight: number;
  count: number;
  onAdd: () => void;
  onRemove: () => void;
  isMetric: boolean;
}

// Props for the main DayPlanner component.
interface DayPlannerProps {
  date: Date;
}

// =================================================================================
// Static Data & Helper Components
// =================================================================================

// Static set types data: a mapping of set type keys to their display names and icons.


interface SetType {
  id: number;
  name: string;
  icon: ReactNode; // Accepts JSX instead of a string
}

// Represents a set type (for example, normal, pyramid, drop set) with its display icon.


const setTypes: Record<string, SetType> = {
  straight: { id: 1, name: "Straight Sets", icon: <Dumbbell size={20} /> },
  drop: { id: 2, name: "Drop Sets", icon: <ArrowDownCircle size={20} /> },
  super: { id: 3, name: "Super Sets", icon: <Plus size={20} /> },
  giant: { id: 4, name: "Giant Sets", icon: <Layers size={20} /> },
  pyramid: { id: 5, name: "Pyramid Sets", icon: <Triangle size={20} /> },
  restPause: { id: 6, name: "Rest-Pause Sets", icon: <Pause size={20} /> },
  cluster: { id: 7, name: "Cluster Sets", icon: <CircleDot size={20} /> },
  mechDrop: { id: 8, name: "Mechanical Drop Sets", icon: <CornerDownLeft size={20} /> },
  preExhaust: { id: 9, name: "Pre-Exhaust Sets", icon: <Zap size={20} /> },
  tut: { id: 10, name: "Time Under Tension (TUT)", icon: <Timer size={20} /> },
};

// WeightPlate Component: Displays one weight plate. It shows the weight number and a count (if any).
// A left-click adds a plate, and a right-click (context menu) removes one.
const WeightPlate: React.FC<WeightPlateProps> = ({ weight, count, onAdd, onRemove, isMetric }) => {
  // Convert weight for display based on metric setting
  const imperialWeights = [45, 35, 25, 10, 5]; // lbs
  const metricWeights = [20, 15, 10, 5, 2.5]; // kg
  
  let displayWeight;
  
  if (isMetric) {
    displayWeight = metricWeights[imperialWeights.indexOf(weight)] || weight * 0.453592; 
  } else {
    displayWeight = weight;
  }
  
  
  return (
    <div 
      className={`weight-plate weight-${weight}`}
      onClick={onAdd}
      onContextMenu={(e) => {
        e.preventDefault();
        onRemove();
      }}
    >
      <span>{displayWeight}</span>
      {count > 0 && <span className="weight-count">{count}</span>}
    </div>
  );
};

  // ---------------------------------------------------------------------------------
  // Constants for Default Values
  // ---------------------------------------------------------------------------------
  const DEFAULT_REPS = 0;
  const DEFAULT_TIMER = 0;
  const DEFAULT_SET_TYPE = 'straight';

// =================================================================================
// Main DayPlanner Component
// =================================================================================

const DayPlanner: React.FC<DayPlannerProps> = ({ date }) => {
  // ---------------------------------------------------------------------------------
  // API Integration States
  // ---------------------------------------------------------------------------------
  // userId: The unique ID of the current user fetched from the API.
  const [userId, setUserId] = useState<number | null>(null);
  // exercises: List of exercises returned by the search API.
  const [exercises, setExercises] = useState<Exercise[]>([]);
  // setTemplates: List of workout set templates fetched from the API.
  const [setTemplates, setSetTemplates] = useState<SetTemplate[]>([]);
  // isMetric: Whether the user prefers metric (kg) or imperial (lbs) units
  const [isMetric, setIsMetric] = useState<boolean>(false);

  // ---------------------------------------------------------------------------------
  // Original Component States
  // ---------------------------------------------------------------------------------
  // sets: Array of workout sets the user has added.
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  // searchTerm: The current term entered by the user for exercise search.
  const [searchTerm, setSearchTerm] = useState('');
  // selectedExercise: The exercise chosen by the user from the search results.
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  // weights: An object tracking the count of each weight plate (keyed by weight value).
  const [weights, setWeights] = useState<Record<string, number>>({});
  // reps: The number of repetitions for the current set.
  const [reps, setReps] = useState(DEFAULT_REPS);
  // timer: The rest period (in seconds) for the current set.
  const [timer, setTimer] = useState(DEFAULT_TIMER);
  // isTimerRunning: Flag indicating if the timer is running (currently not in use).
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // setType: The current type of set (e.g., normal, pyramid).
  const [setType, setSetType] = useState('straight');

  const { userInfo, userInfoLoading, refreshUserInfo } = useAuth();




  // ---------------------------------------------------------------------------------
  // Fetch User Info on Component Mount
  // ---------------------------------------------------------------------------------
  // Fetch the user's unit preference (metric or imperial) from the user info
  useEffect(() => {
    // Set the metricSystem state based on the user's preference
    if(userInfo) {
      setUserId(Number(userInfo.id) || null);
        setIsMetric(userInfo.metric_system);
    }
  }, [userInfo]); // This effect runs whenever userInfo changes
  
  // ---------------------------------------------------------------------------------
  // Fetch Set Templates on Component Mount
  // ---------------------------------------------------------------------------------
  useEffect(() => {
    const fetchSetTemplates = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/get-all-set-templates`, {
          credentials: "include", // This ensures cookies are sent with the request.
        });
        
        if (!response.ok) {
          console.error('Failed to fetch templates, status:', response.status);
          throw new Error('Failed to fetch set templates');
        }
        
        const data = await response.json();
        setSetTemplates(data.templates);
      } catch (error) {
        console.error('Error fetching set templates:', error);
      }
    };

    fetchSetTemplates();
  }, []);

  // ---------------------------------------------------------------------------------
  // Exercise Search Effect: Called when the search term changes.
  // ---------------------------------------------------------------------------------
  useEffect(() => {
    const searchExercises = async () => {
      // If no search term is provided, clear the exercise list.
      if (!searchTerm) {
        setExercises([]);
        return;
      }

      try {
        const response = await authFetch(
          `${API_BASE_URL}/search-for-exercise?searchTerm=${encodeURIComponent(searchTerm)}`,
          {
            credentials: "include", // This ensures cookies are sent with the request.
          }
        );
        
        if (!response.ok) {
          console.error('Exercise search failed, status:', response.status);
          console.error('Search URL:', `${API_BASE_URL}/search-for-exercise?searchTerm=${encodeURIComponent(searchTerm)}`);
          throw new Error(`Failed to search exercises: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.exercises)) {
          setExercises(data.exercises);
        } else {
          console.error('Received invalid exercise data format:', data);
          setExercises([]);
        }
      } catch (error) {
        console.error('Error searching exercises:', error);
        setExercises([]);
      }
    };

    // Add a short delay to avoid making too many API calls
    const timeoutId = setTimeout(searchExercises, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // ---------------------------------------------------------------------------------
  // Track Date Changes: Logs whenever the date prop changes.
  // ---------------------------------------------------------------------------------
  useEffect(() => {

  }, [date]);

  // ---------------------------------------------------------------------------------
  // Helper Function: Format the date in a human-friendly way.
  // ---------------------------------------------------------------------------------
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // ---------------------------------------------------------------------------------
  // Helper Function: Reset the form inputs to their default values.
  // ---------------------------------------------------------------------------------
  const handleReset = () => {
    setWeights({});
    setReps(DEFAULT_REPS);
    setTimer(DEFAULT_TIMER);
    setSetType(DEFAULT_SET_TYPE);
  };

  // ---------------------------------------------------------------------------------
  // Delete Set Handler: Deletes a set from both the server and local state.
  // ---------------------------------------------------------------------------------
  const handleDeleteSet = async (indexToDelete: number) => {
    // Get the set object that needs to be deleted using its index.
    const setToDelete = sets[indexToDelete];
    
    // Make sure both the set ID and the user ID exist.
    if (!setToDelete.id || !userId) {
      console.error('Cannot delete set: missing set ID or user ID', {
        setId: setToDelete.id,
        userId: userId
      });
      return;
    }

    try {
      // IMPORTANT: The server expects a DELETE request with a JSON body containing
      // userId and setId, so we send the data in the body.
      const response = await authFetch(`${API_BASE_URL}/remove-set-from-split`, {
        method: 'DELETE',
        credentials: "include", // This ensures cookies are sent with the request.,
        body: JSON.stringify({
          userId,
          setId: setToDelete.id
        })
      });

      if (!response.ok) {
        console.error('Failed to delete set, status:', response.status);
        throw new Error('Failed to delete set');
      }

      // Remove the deleted set from the local state.
      setSets(prevSets => {
        const newSets = prevSets.filter((_, index) => index !== indexToDelete);
        return newSets;
      });
    } catch (error) {
      console.error('Error deleting set:', error);
    }
  };

  // ---------------------------------------------------------------------------------
  // Helper Function: Calculate the total weight including the bar weight.
  // ---------------------------------------------------------------------------------
  const calculateTotalWeight = (weightObj: Record<string, number> = weights) => {
    // Start with the bar weight (45 lbs or 20 kg)
    // Always store weight internally as imperial (lbs)
    let barWeight = 0; // Standard Olympic bar weight in lbs
    
    // For each weight plate, add its weight multiplied by the count and doubled (for both sides).
    let plateWeight = 0;
    Object.entries(weightObj).forEach(([weight, count]) => {
      plateWeight += Number(weight) * count * 2;
    });
    
    const totalLbs = barWeight + plateWeight;
    
    // Convert to kg if the user prefers metric, but always store as lbs
    // Return the calculated total weight
    return totalLbs;
  };

  // Function to get display weight according to user preference
  const getDisplayWeight = (weightLbs: number) => {
    if (isMetric) {
      // Convert lbs to kg and round to nearest 0.5
      const weightKg = weightLbs * 0.453592;
      return Math.round(weightKg * 2) / 2;
    }
    return weightLbs;
  };

// Function to get the weight unit based on user preference
const getWeightUnit = () => {
  return isMetric ? 'kg' : 'lbs';
};

// ---------------------------------------------------------------------------------
// Weight Handlers: Functions to add or remove a weight plate.
// ---------------------------------------------------------------------------------
const handleAddWeight = (weight: number) => {
  setWeights(prev => {
    const newWeights = {
      ...prev,
      [weight]: (prev[weight] || 0) + 1
    };
    return newWeights;
  });
};

const handleRemoveWeight = (weight: number) => {
  setWeights(prev => {
    if (!prev[weight] || prev[weight] <= 0) return prev;
    const newWeights = {
      ...prev,
      [weight]: prev[weight] - 1
    };
    return newWeights;
  });
};

// ---------------------------------------------------------------------------------
// Helper Function: Calculate total time for all sets.
// ---------------------------------------------------------------------------------
const calculateTotalTime = () => {
  // Sum up the timer values of all previously added sets.
  const previousSetsTime = sets.reduce((total, set) => total + set.timer, 0);
  // If an exercise is selected, add the current timer value.
  const totalTime = selectedExercise ? previousSetsTime + timer : previousSetsTime;
  return totalTime;
};

// ---------------------------------------------------------------------------------
// Timer Handlers: Increase or decrease the timer by 15 seconds.
// ---------------------------------------------------------------------------------
const handleAddTime = () => {
  setTimer(prevTimer => {
    const newTimer = Math.min(prevTimer + 15, 300);
    return newTimer;
  });
};

const handleRemoveTime = () => {
  setTimer(prevTimer => {
    const newTimer = Math.max(prevTimer - 15, 0);
    return newTimer;
  });
};

// ---------------------------------------------------------------------------------
// Add Set Handler: Adds a new workout set after validating input and sending details to the server.
// ---------------------------------------------------------------------------------
const handleAddSet = async () => {
  // First, check if we have all the needed information before proceeding
  if (!selectedExercise || !userId) {
    console.error('Validation failed:', {
      hasSelectedExercise: !!selectedExercise,
      hasUserId: !!userId
    });
    return;
  }

  try {
    // Calculate the total weight for the set - ALWAYS IN LBS for storage
    const totalWeight = calculateTotalWeight();
    
    // Get the correct template ID from the setTypes object
    const currentSetType = setTypes[setType];
    if (!currentSetType) {
      throw new Error(`Invalid set type: ${setType}`);
    }

    // IMPORTANT: Always send the weight in LBS to the server regardless of user preference
    // The server expects weight in a consistent unit and converts as needed
    const payload = {
      userId: userId.toString(),
      scheduledDate: date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      setTemplateId: currentSetType.id.toString(),
      plannedBaseWeight: totalWeight.toString(), // Always store in lbs
      exerciseId: selectedExercise.id.toString()
    };

    // Send the API request to add the set
    const response = await authFetch(`${API_BASE_URL}/add-set-to-split`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Failed to add set: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if the API returned a sets array
    if (!data.sets || !Array.isArray(data.sets) || data.sets.length === 0) {
      console.error('API response missing sets array:', data);
      throw new Error('Invalid API response: missing sets array');
    }
    
    // For each set in the response, add it to our local state
    const newSets = (data.sets ?? []).map((setData: { setId: string; restPeriod?: number }) => ({
      id: setData.setId,
      exercise: {
        id: selectedExercise.id,
        name: selectedExercise.name,
        muscleTargets: selectedExercise.muscleTargets
      },
      weights: { ...weights },
      reps,
      timer: setData.restPeriod ?? timer,
      setType
    }));
    
    
    
    // Add the new sets to our local state
    setSets(prevSets => [...prevSets, ...newSets]);
    
    // Reset form after successful addition
    handleReset();

  } catch (error) {
    console.error('Error in handleAddSet:', error);
  }
};

// ---------------------------------------------------------------------------------
// Main Render: JSX for the DayPlanner component.
// ---------------------------------------------------------------------------------
return (
  <div className="workout-day">
    {/* Display the formatted date */}
    <h2 className='workout-date'>{formatDate(date)}</h2>
    
    {/* Exercise search input and list */}
    <div className="exercise-search">
      <input
        type="text"
        placeholder="Search exercises..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="exercise-list">
        {exercises
          .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(exercise => (
            <div 
              key={exercise.id}
              className="exercise-item"
              onClick={() => {
                setSelectedExercise(exercise);
              }}>
              <div className='exercise-name'>{exercise.name}</div>
              <div className="muscle-ratios">
                {exercise.muscleTargets.map(({ muscle, percentage }) => (
                  <div key={muscle}>
                    {muscle}: {percentage.toFixed(0)}%
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>

    {/* Set builder section (visible only if an exercise is selected) */}
    {selectedExercise && (
      <div className="set-builder">
        <div className="set-type-selector">
          {Object.entries(setTypes).map(([type, info]) => (
            <button
              key={type}
              className={`set-type-btn ${setType === type ? 'active' : ''}`}
              onClick={() => {
                setSetType(type);
              }}
            >
              <div className='set-icon'>{info.icon}</div>
              <div className='set-name'>{info.name}</div>
            </button>
          ))}
        </div>

        {/* Display total weight with proper unit */}
        <div className="weight-total">
          <div className='weight-total-label'>
            <label className='weight'>Total Weight:</label>
            <label className='weight-number'>
              {getDisplayWeight(calculateTotalWeight())} {getWeightUnit()}
            </label>
          </div>
        </div>

        {/* Weight plates for interaction - with proper unit display */}
        <div className="weight-plates">
          {[45, 35, 25, 10, 5].map(weight => (
            <WeightPlate
              key={weight}
              weight={weight}
              count={weights[weight] || 0}
              onAdd={() => handleAddWeight(weight)}
              onRemove={() => handleRemoveWeight(weight)}
              isMetric={isMetric}
            />
          ))}
        </div>

        {/* Reps slider input */}
        <div className="reps-slider">
          <div className='reps-label'>
            <label className='reps'>Reps:</label>
            <label className='reps-number'>{reps}</label>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={reps}
            onChange={(e) => {
              const newReps = Number(e.target.value);
              setReps(newReps);
            }}
          />
        </div>

        {/* Display total time */}
        <div className="timer-total">
          <div className='timer-total-label'>
            <label className='time-label'>Total Time:</label>
            <label className='time-number'>{calculateTotalTime()}s</label>
          </div>
        </div>

        {/* Timer controls to add or remove time */}
        <div className="timer-control">
          <button onClick={handleRemoveTime}>
            <label className='subtract-time'>-15s</label>
          </button>
          <button onClick={handleAddTime}>
            <label className='add-time'>+15s</label>
          </button>
        </div>

        {/* Buttons to reset the form or add the set */}
        <div className='add-set-grid'>
          <button 
            className="reset-set-btn" 
            onClick={() => {
              handleReset();
            }}
          >
            Reset
          </button>
          <button 
            className="add-set-btn" 
            onClick={() => {
              handleAddSet();
            }}
          >
            Add
          </button>
        </div>
      </div>
    )}

    {/* List of added workout sets */}
    <div className="sets-list">
      {sets.map((set, index) => {
        return (
          <div key={`${set.id}-${index}`} className="set-item">
            <h3 className="set-exercise-name">{set.exercise.name}</h3>
            <div className="set-type-name">{setTypes[set.setType].name}</div>
            <div className="set-type-icon">{setTypes[set.setType].icon}</div>
            
            <div className="set-stats-container">
              <div className="set-weight-container">
                <div className="set-weight-label">Weight:</div>
                <div className="set-weight-value">
                  {getDisplayWeight(calculateTotalWeight(set.weights))} {getWeightUnit()}
                </div>
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
            
            {/* Delete button for each set */}
            <div className="set-delete">
              <button 
                className="set-delete-button" 
                onClick={() => {
                  handleDeleteSet(index);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
};

export default DayPlanner;

