import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, ArrowRight, Pause, Check, X, Play } from 'lucide-react';
import './LogWorkout.css';
import { authFetch } from '../../../auth/token/authFetch';
import { useAuth } from '../../../auth/auth-context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Interface for each workout set from the backend
interface WorkoutSet {
  plan_id: number;
  user_id: number;
  scheduled_date: string;
  planned_base_weight?: string;
  phase_number?: number;
  rep_range_min?: number;
  rep_range_max?: number;
  weight_modifier?: number;
  target_rest_period_seconds?: number;
  set_type_name?: string;
  set_type_id?: number; // To store set type id in the database
  exercise_id: number;
  exercise_name: string; // Now coming from the database
  equipment: string;     // Now coming from the database
  exercise_category: string;
  set_number?: number;
  targeted_muscles?: string[]; // Additional field for muscle groups (array)
}

// Interface for the updated API response from fetching workout sets
interface ApiResponse {
  success: boolean;
  sets: WorkoutSet[];
  organizedWorkout?: {
    date: string;
    userId: string;
    planId: number;
    exercises: {
      exerciseId: number;
      exerciseName: string;
      equipment: string;
      targetedMuscles: string[];
      sets: any[];
    }[];
  };
}

// Interface to group sets by exercise
interface GroupedExercise {
  exerciseId: number;
  name: string;
  category: string;
  equipment: string; // Added equipment field
  targetedMuscles: string[]; // Added targeted muscles field
  sets: {
    setNumber: number;
    weight: number;
    repRangeMin: number;
    repRangeMax: number;
    averageReps: number;
    targetRestPeriod: number;
    setType: string;
    setTypeId: number; // For database reference
    planId: number;
    phaseNumber: number;
  }[];
}

// Interface for a completed set (user's interaction with the set)
interface CompletedSet {
  exerciseId: number;
  exerciseName: string;
  equipment: string; // Added equipment field
  weight: number;
  reps: number;
  setNumber: number;
  planId: number;
  phaseNumber: number;
  setTypeId: number; // Set type id
  isCompleted: boolean;
  isActive: boolean;
  timerStart?: number;
  timerRunning: boolean;
  actualRestPeriod?: number;
  feedback?: string;  // To store feedback messages
  feedbackTimestamp?: number; // To track when feedback was shown
}

// Updated interface for the add-set-to-split API request
interface AddSetToSplitRequest {
  userId: number;
  scheduledDate: string;
  setTypeId: number;       // Using setTypeId instead of setTemplateId
  plannedBaseWeight: number;
  exerciseId: number;
}

// Response from the add-set-to-split API
interface AddSetToSplitResponse {
  success: boolean;
  message: string;
  workoutPlanId: number;
  setTypeId: number;
  exerciseId: number;
  baseWeight: number;
  sets: {
    setId: number;
    phaseNumber: number;
    templateId: number;
    weight: number;
    restPeriod: number;
  }[];
}

const LogWorkout = () => {
  // State variables used in the component
  const [userId, setUserId] = useState<string>("");
  const [workoutData, setWorkoutData] = useState<GroupedExercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completedSets, setCompletedSets] = useState<{[key: string]: CompletedSet}>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [timerTick, setTimerTick] = useState<number>(0);
  const [metric, setMetric] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null); // For in-screen messages
  const [showCongratulations, setShowCongratulations] = useState(false);

  const { userInfo, userInfoLoading, refreshUserInfo } = useAuth();

  // Function to get the weight increment based on user system:
  // 2.5 for metric, 5 for imperial (lbs)
  // FIXED: Changed useMetric to metric
  const getWeightIncrement = (): number => {
    return metric ? 2.5 : 5;
  };

  // Get display string for the increment button (e.g., "+2.5 kg" or "+5 lbs")
  const getIncrementDisplay = (): string => {
    const value = getWeightIncrement();
    return `+${value}`;
  };

  // Get display string for the decrement button (e.g., "-2.5 kg" or "-5 lbs")
  const getDecrementDisplay = (): string => {
    const value = getWeightIncrement();
    return `-${value}`;
  };

  // Conversion function to display weight correctly based on unit system
  // FIXED: Changed useMetric to metric
  const displayWeight = (weightKg: number) => {
    const result = metric ? weightKg : Math.round(weightKg * 2.20462);
   
    return result;
  };

  // Conversion function to save weight in kilograms regardless of display
  // FIXED: Changed useMetric to metric
  const saveWeight = (weightDisplay: number) => {
    const result = metric ? weightDisplay : weightDisplay / 2.20462;
   
    return result;
  };

  // Format weight with unit for display
  // FIXED: Changed useMetric to metric
  const formatWeight = (weight: number) => {
    const formatted = `${weight} ${metric ? 'kg' : 'lbs'}`;
   
    return formatted;
  };

  

  // Timer effect: updates timerTick every second if any timer is running.
  // We use timerTick as a dummy variable to force a re-render every second.
  useEffect(() => {
    // Check if any set has a running timer
    const hasRunningTimer = Object.values(completedSets).some(set => set.timerRunning);
    let interval: NodeJS.Timeout | null = null;
    
    if (hasRunningTimer) {
      // Set interval to update every 1000ms (1 second)
      interval = setInterval(() => {
        setTimerTick(t => t + 1);
      }, 1000);
     
    }
    
    // Cleanup: clear the interval when no timer is running or component unmounts
    return () => { 
      if (interval) {
        clearInterval(interval);
       
      }
    };
  }, [completedSets]);

  // Effect to clear feedback messages after 3 seconds
  useEffect(() => {
    const feedbackTimeout = setTimeout(() => {
      const now = Date.now();
      setCompletedSets(prev => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach(key => {
          if (updated[key].feedback && updated[key].feedbackTimestamp && (now - updated[key].feedbackTimestamp > 3000)) {
            updated[key] = { ...updated[key], feedback: undefined, feedbackTimestamp: undefined };
            changed = true;
          }
        });
        return changed ? updated : prev;
      });
      if (feedbackMessage) {
        setFeedbackMessage(null);
      }
    }, 3000);
    
    return () => clearTimeout(feedbackTimeout);
  }, [timerTick, feedbackMessage]);

  // Helper functions for formatting dates
  // Modified date formatting to use device timezone
  const formatDate = (date: Date): string => {
    // Convert to ISO string but keep local date parts
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0];
  };


  const getReadableDate = (date: Date): string => {
    return date.toLocaleDateString(navigator.language, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Navigation functions to go to previous or next day
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
   
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
   
  };

    // Fetch the user's unit preference (metric or imperial) from the user info
    useEffect(() => {
     
      
      // Set the metricSystem state based on the user's preference
      if(userInfo) {
          setMetric(userInfo.metric_system);
          setUserId(userInfo.id);
         
      }
  }, [userInfo]); // This effect runs whenever userInfo changes


  // Fetch workout data when userId or selectedDate changes
  useEffect(() => { 
    if (userId) {
     
      fetchWorkoutData();
    } 
  }, [userId, selectedDate]);

  // GROUP SETS BY EXERCISE FUNCTION
  // Groups sets by exercise for easier handling in UI
  const groupSetsByExercise = (sets: WorkoutSet[]): GroupedExercise[] => {
   
    
    const exerciseMap: { [key: number]: GroupedExercise } = {};
    sets.forEach(set => {
     
      
      if (!exerciseMap[set.exercise_id]) {
        exerciseMap[set.exercise_id] = {
          exerciseId: set.exercise_id,
          name: set.exercise_name,
          category: set.exercise_category || '', // Fallback to empty string if not defined
          equipment: set.equipment || 'None', // Added equipment with fallback
          targetedMuscles: set.targeted_muscles || [], // Add muscle groups
          sets: []
        };
       
      }
      
      const baseWeight = parseFloat(set.planned_base_weight || "0") || 0;
      const modifier = set.weight_modifier || 1;
      const calculatedWeight = baseWeight * modifier;
      
      exerciseMap[set.exercise_id].sets.push({
        setNumber: set.set_number || 0,
        weight: calculatedWeight,
        repRangeMin: set.rep_range_min || 0,
        repRangeMax: set.rep_range_max || 0,
        averageReps: Math.round(((set.rep_range_min || 0) + (set.rep_range_max || 0)) / 2),
        targetRestPeriod: set.target_rest_period_seconds || 0,
        setType: set.set_type_name || "",
        setTypeId: set.set_type_id || 1,
        planId: set.plan_id,
        phaseNumber: set.phase_number || 1
      });
      
     
    });
    
    // Sort exercises by their sets in order
    const sortedExercises = Object.values(exerciseMap).map(exercise => {
      exercise.sets.sort((a, b) => a.setNumber - b.setNumber);
      return exercise;
    });
    
   
    return sortedExercises;
  };

  // PROCESS ORGANIZED WORKOUT DATA FUNCTION
  // Process workout data from the new API format
  const processOrganizedWorkoutData = (organizedWorkout: any): GroupedExercise[] => {
   
    
    if (!organizedWorkout || !organizedWorkout.exercises || !Array.isArray(organizedWorkout.exercises)) {
      console.error('[DATA-PROCESSING] Invalid organized workout data structure:', organizedWorkout);
      return [];
    }
    
    const groupedExercises: GroupedExercise[] = organizedWorkout.exercises.map((exercise: any) => {
      const mappedSets = exercise.sets.map((set: any) => ({
        setNumber: set.phase_number ?? 0,
        weight: parseFloat(set.planned_base_weight ?? "0"),
        repRangeMin: set.rep_range_min ?? 0,
        repRangeMax: set.rep_range_max ?? 0,
        averageReps: Math.round(((set.rep_range_min ?? 0) + (set.rep_range_max ?? 0)) / 2),
        targetRestPeriod: set.target_rest_period_seconds ?? 0,
        setType: set.setTypeName ?? "",
        setTypeId: set.setTypeId ?? 1,
        planId: organizedWorkout.planId,
        phaseNumber: set.phase_number ?? 1
      }));
    
      // Sort the sets by phase number
      mappedSets.sort((a: any, b: any) => a.phaseNumber - b.phaseNumber);
    
      return {
        exerciseId: exercise.exerciseId,
        name: exercise.exerciseName,
        category: exercise.exercise_category ?? "",
        equipment: exercise.equipment,
        targetedMuscles: exercise.targetedMuscles,
        sets: mappedSets
      };
    });
   
    return groupedExercises;
  };

  // FETCH WORKOUT DATA FUNCTION
  // Fetch workout data from backend API for the selected date
  const fetchWorkoutData = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/get-sets-for-day?userId=${userId}&date=${formatDate(selectedDate)}`, {
        credentials: "include", // This ensures cookies are sent with the request.
      });
      const data: ApiResponse = await response.json();
      console.log("API response data:", data);
      
      if (data.success) {
       
        
        let groupedExercises: GroupedExercise[] = [];
        
        // Check if we have the new organizedWork
        // Check if we have the new organizedWorkout format
        if (data.organizedWorkout) {
         
          groupedExercises = processOrganizedWorkoutData(data.organizedWorkout);
        } 
        // Fallback to the old format if organizedWorkout is not available
        else if (Array.isArray(data.sets)) {
         
         
          groupedExercises = groupSetsByExercise(data.sets);
        }
        
       
        setWorkoutData(groupedExercises);
        
        // Initialize completedSets for each set
        const initialCompletedSets: { [key: string]: CompletedSet } = {};
        groupedExercises.forEach((exercise, exIdx) => {
          exercise.sets.forEach((set, setIdx) => {
            const key = `${exIdx}-${setIdx}`;
            initialCompletedSets[key] = {
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.name,
              equipment: exercise.equipment || 'None', // Add equipment information
              weight: set.weight,
              reps: set.averageReps,
              setNumber: set.setNumber,
              planId: set.planId,
              phaseNumber: set.phaseNumber,
              setTypeId: set.setTypeId,
              isCompleted: false,
              isActive: false,
              timerRunning: false,
              timerStart: undefined,
              actualRestPeriod: undefined,
            };
           
          });
        });
        setCompletedSets(initialCompletedSets);
        
        // Debug: log sets with target rest periods
        groupedExercises.forEach((exercise, exIdx) => {
          exercise.sets.forEach((set, setIdx) => {
            if (set.targetRestPeriod > 0) {
             
            }
          });
        });
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('[DATA] Fetch error:', err);
    }
  };

  // NEW FUNCTION: Add a set to a workout split using the updated API
  // This function adds a set to the current workout day
  const addSetToSplit = async (exerciseId: number, setTypeId: number, plannedBaseWeight: number) => {
    try {
      // Prepare request data for the new API
      const requestData: AddSetToSplitRequest = {
        userId: parseInt(userId),
        scheduledDate: formatDate(selectedDate),
        setTypeId: setTypeId,
        plannedBaseWeight: plannedBaseWeight,
        exerciseId: exerciseId
      };
      
     
      
      // Call the new add-set-to-split API endpoint
      const response = await authFetch(`${API_BASE_URL}/add-set-to-split`, {
        method: 'POST',
        credentials: "include", // This ensures cookies are sent with the request.
        body: JSON.stringify(requestData)
      });
      
      const result: AddSetToSplitResponse = await response.json();
     
      
      if (result.success) {
        // Show success message
        setFeedbackMessage(`Added ${result.sets.length} phases of set to workout`);
        
        // Reload workout data to show the newly added set
        await fetchWorkoutData();
        
       
        return result;
      } else {
        throw new Error('Failed to add set to workout');
      }
    } catch (err: any) {
      console.error('[ADD-SET] Error adding set to split:', err);
      setFeedbackMessage(`Error adding set: ${err.message || 'Unknown error'}`);
      return null;
    }
  };

  // TIMER CONTROL FUNCTIONS

  // Start the timer for a given set.
  // This sets timerRunning to true and records the start time.
  const startTimer = (key: string) => {
   
    setCompletedSets(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        timerRunning: true,
        timerStart: Date.now(),
        actualRestPeriod: undefined
      }
    }));
  };

  // Stop the timer for a given set.
  // This calculates the elapsed time in whole seconds and stores it in actualRestPeriod.
  const stopTimer = (key: string) => {
   
    setCompletedSets(prev => {
      const currentSet = prev[key];
      if (currentSet?.timerRunning && currentSet.timerStart) {
        const elapsed = Math.floor((Date.now() - currentSet.timerStart) / 1000);
       
        return {
          ...prev,
          [key]: {
            ...currentSet,
            timerRunning: false,
            actualRestPeriod: elapsed
          }
        };
      }
      return prev;
    });
  };

  // Mark a set as active when user interacts with it
  const markSetActive = (key: string) => {
    if (!completedSets[key].isActive) {
     
      setCompletedSets(prev => ({
        ...prev,
        [key]: { ...prev[key], isActive: true }
      }));
    }
  };

  // Weight adjustment functions
  const incrementWeight = (exIdx: number, setIdx: string) => {
    const key = `${exIdx}-${setIdx}`;
   
    markSetActive(key);
    setCompletedSets(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        weight: prev[key].weight + getWeightIncrement()
      }
    }));
   
  };

  const decrementWeight = (exIdx: number, setIdx: string) => {
    const key = `${exIdx}-${setIdx}`;
   
    markSetActive(key);
    setCompletedSets(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        weight: Math.max(0, prev[key].weight - getWeightIncrement())
      }
    }));
   
  };

  // Reps adjustment functions
  const incrementReps = (exIdx: number, setIdx: string) => {
    const key = `${exIdx}-${setIdx}`;
   
    markSetActive(key);
    setCompletedSets(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        reps: prev[key].reps + 1
      }
    }));
   
  };

  const decrementReps = (exIdx: number, setIdx: string) => {
    const key = `${exIdx}-${setIdx}`;
   
    markSetActive(key);
    setCompletedSets(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        reps: Math.max(0, prev[key].reps - 1)
      }
    }));
   
  };

  // Mark set as completed and stop timer if running
  const completeSet = (exIdx: number, setIdx: string) => {
    const key = `${exIdx}-${setIdx}`;
   
    if (completedSets[key].timerRunning) stopTimer(key);
    setCompletedSets(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        isCompleted: true, 
        timerRunning: false,
        isActive: true
      }
    }));
  };

  // Delete a set (mark as completed with 0 reps and 0 rest period)
  const deleteSet = (exIdx: number, setIdx: string) => {
    const key = `${exIdx}-${setIdx}`;
   
    if (completedSets[key].timerRunning) stopTimer(key);
    setCompletedSets(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        isCompleted: true, 
        reps: 0, 
        actualRestPeriod: 0,
        isActive: true
      }
    }));
  };

  // UPDATED FUNCTION: Save completed workout to the server
  // This function now uses the updated API to log completed sets
  const saveCompletedWorkout = async () => {
    try {
      setIsSaving(true);
      setShowCongratulations(true);
      setFeedbackMessage(null); // Clear any existing feedback
      
      // Stop any running timers before saving
      Object.keys(completedSets).forEach(key => {
        if (completedSets[key].timerRunning) {
         
          stopTimer(key);
        }
      });

      // Filter active sets (ones that user interacted with)
      const activeSets = Object.values(completedSets).filter(set => set.isActive);
     
      
      if (activeSets.length === 0) {
        console.warn('[SAVE] No active sets to save');
        setFeedbackMessage('Please complete at least one set before saving');
        setIsSaving(false);
        return;
      }
      
      // Group sets by exercise for backend API
      const setsByExercise: { [key: number]: any } = {};
      
      // Debug log for all active sets
      activeSets.forEach((set, idx) => {
       
      });
      
      // Group the sets by exercise ID
      activeSets.forEach(set => {
        if (!set.exerciseId) {
          console.error(`[SAVE-ERROR] Missing exerciseId for set with name ${set.exerciseName}!`);
          throw new Error(`Missing exerciseId for set with name ${set.exerciseName}`);
        }

      
        
        if (!setsByExercise[set.exerciseId]) {
          setsByExercise[set.exerciseId] = {
            userId: parseInt(userId),
            setTypeId: set.setTypeId,
            exerciseId: set.exerciseId,
            baseWeight: saveWeight(set.weight),
            scheduledDate: formatDate(selectedDate),
            phases: []
          };
        }
        
        setsByExercise[set.exerciseId].phases.push({
          phaseNumber: set.phaseNumber || 1,
          actualReps: set.reps,
          actualWeight: saveWeight(set.weight),
          actualRestPeriodSeconds: set.actualRestPeriod || 0
        });
      });
      
      const setsToSave = Object.values(setsByExercise);
     

      
      // Additional validation before saving
      setsToSave.forEach((exerciseSet, index) => {
       
        if (!exerciseSet.exerciseId) {
          console.error(`[SAVE-ERROR] Missing exerciseId for set ${index + 1}!`);
          throw new Error(`Missing exerciseId for set ${index + 1}`);
        }
      });
      
      // Save each exercise set one by one
      for (const exerciseSet of setsToSave) {
       
        
        if (!exerciseSet.exerciseId) {
          throw new Error(`Missing exerciseId for set with userId ${exerciseSet.userId}`);
        }
        
        // Call the log-completed-set API
        const response = await authFetch(`${API_BASE_URL}/log-completed-set`, {
          method: 'POST',
          credentials: "include", // This ensures cookies are sent with the request.,
          body: JSON.stringify(exerciseSet)
        });
        
        const result = await response.json();
       
        
        if (!result.success) {
          throw new Error('Save failed: ' + (result.error || 'Unknown error'));
        }
      }
      
      // Refresh the workout data after saving
      await fetchWorkoutData();
      setIsSaving(false);
      setFeedbackMessage('Workout saved successfully!');
     
    } catch (err: any) {
      console.error('[SAVE] Error:', err);
      setError('Save failed: ' + (err.message || 'Unknown error'));
      setIsSaving(false);
      setFeedbackMessage('Save failed: ' + (err.message || 'Unknown error'));
    }
  };

  // Format time to display in minutes and seconds (e.g., "1:05")
  // This function uses whole seconds with no milliseconds.
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Group sets by their type (e.g., "Warmup", "Working Set")
  const groupSetsByType = (sets: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    sets.forEach(set => {
      if (!grouped[set.setType]) grouped[set.setType] = [];
      grouped[set.setType].push(set);
    });
    return grouped;
  };

  // Get current timer value for a set (in whole seconds).
  // If the timer is still running, calculate the elapsed time.
  // If not running and an actualRestPeriod exists (from stopping the timer), show that.
  // Otherwise, show the default timer value.
  const getCurrentTimerDisplay = (cSet: CompletedSet, defaultTimer: number) => {
    if (cSet.timerRunning) {
      return formatTime(Math.floor((Date.now() - (cSet.timerStart || 0)) / 1000));
    } else {
      return cSet.actualRestPeriod !== undefined 
        ? formatTime(cSet.actualRestPeriod)
        : formatTime(defaultTimer);
    }
  };

  return (
  <div className="LogWorkout-Main-Container">
    <div className="LogWorkout-container">
      <div className="Date-navigator">
        <button onClick={goToPreviousDay} className="Date-nav-button">
        <ArrowLeft color="#ffffff" strokeWidth={3} />
        </button>
        <div className="Current-date">
          <span>{getReadableDate(selectedDate)}</span>
        </div>
        <button onClick={goToNextDay} className="Date-nav-button">
        <ArrowRight color="#ffffff" strokeWidth={3} />
        </button>
        <button 
          className="Save-button"
          onClick={saveCompletedWorkout}
          disabled={isSaving}
        >
          {isSaving ? '...' : 'Done'}
        </button>
      </div>
      
      {/* Feedback message area for errors or success */}
      {feedbackMessage && (
        <div className="Feedback-message-container">
          <p>{feedbackMessage}</p>
        </div>
      )}
      
      <div className="LogWorkout-days">
        {workoutData.length > 0 ? (
          workoutData.map((exercise, exIdx) => {
            // Map each set to add a unique index for identification
            const setsWithIndex = exercise.sets.map((set, idx) => ({ ...set, originalIndex: idx }));
            const setsByType = groupSetsByType(setsWithIndex);

            return (
              <div className="Day-card" key={exIdx}>
                <div className="Day-header">
                  
                </div>
                <div className="Exercise-list">
                  {Object.entries(setsByType).map(([type, sets]) => {
                    // Filter to only uncompleted sets of this type
                    const uncompletedSets = sets.filter(set => {
                      const key = `${exIdx}-${set.originalIndex}`;
                      const cSet = completedSets[key];
                      return !cSet?.isCompleted;
                    });
                    
                    // Only render this section if there are uncompleted sets
                    if (uncompletedSets.length === 0) return null;
                    
                    return (
                      <div key={type}>
                        <h1 className='Set-Type'>{type}</h1>
                        {sets.map((set: any) => {
                          const key = `${exIdx}-${set.originalIndex}`;
                          const cSet = completedSets[key];
                          if (cSet?.isCompleted) return null;
                          // Determine default timer value: use provided target rest period or default to 60 seconds
                          const defaultTimer = (set.targetRestPeriod && set.targetRestPeriod > 0) ? set.targetRestPeriod : 60;
                          
                          return (
                            <div className={`Exercise-item ${cSet?.isActive ? 'active' : ''}`} key={key}>
                              {cSet?.feedback && (
                                <div className="Feedback-message">
                                  {cSet.feedback}
                                </div>
                              )}
        
                              {/* THIS IS WHERE THE EXERCISE NAME AND EQUIPMENT GO */}
                              <div className='Exercise-Info-Container'>
                                <h2 className='Exercise-Info'>{exercise.name} ({exercise.equipment})</h2>
                              </div>
                              <div className="Counter">
                                <div className="Counter-item">
                                  {/* Weight adjustment buttons */}
                                  <button 
                                    onClick={() => decrementWeight(exIdx, set.originalIndex)}
                                    title={getDecrementDisplay()}
                                  >
                                    {getDecrementDisplay()}
                                  </button>
                                  <span>{formatWeight(displayWeight(cSet?.weight || 0))}</span>
                                  <button 
                                    onClick={() => incrementWeight(exIdx, set.originalIndex)}
                                    title={getIncrementDisplay()}
                                  >
                                    {getIncrementDisplay()}
                                  </button>
                                </div>
                                <div className="Counter-item">
                                  <button className='minus-one' onClick={() => decrementReps(exIdx, set.originalIndex)}>-1</button>
                                  <span>{cSet?.reps} reps</span>
                                  <button className='plus-one' onClick={() => incrementReps(exIdx, set.originalIndex)}>+1</button>
                                </div>
                              </div>
        
                              {/* Timer section: if timer is running show live time, otherwise, if stopped show the frozen elapsed time.
                                  If timer was never started, show the default timer value. */}
                              <div className="Counter">
                                <div className="Counter-item">
                                  <button className='start-timer'
                                    onClick={() => startTimer(key)}
                                    disabled={cSet?.timerRunning}
                                  >
                                    <Play size={18} strokeWidth={3} />
                                  </button>
                                  <span>
                                    {getCurrentTimerDisplay(cSet, defaultTimer)}
                                  </span>
                                  <button className='stop-timer'
                                    onClick={() => stopTimer(key)}
                                    disabled={!cSet?.timerRunning}
                                  >
                                    <Pause />
                                  </button>
                                </div>
                              </div>
        
                              <div className="Set-actions">
                                <button 
                                  onClick={() => completeSet(exIdx, set.originalIndex)}
                                  title="Complete"
                                  className="Complete-button"
                                >
                                  <Check strokeWidth={3} />
                                </button>
                                <button 
                                  onClick={() => deleteSet(exIdx, set.originalIndex)}
                                  title="Delete"
                                  className="Delete-button"
                                >
                                  <X strokeWidth={3} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="No-workout">
            <p>No Workout Planned</p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default LogWorkout;
