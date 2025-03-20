import React, { useState, useEffect } from "react";
import Select from "react-select";
import { authFetch } from "../../../../../../auth/token/authFetch";
import "./PersonalRecords.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Define what a PR (Personal Record) looks like
type PR = {
  lift: string;
  maxWeight: number;
  firstRecorded: string;
  records: {
    reps: number;
    weight: number;
  }[];
};

// Add props type to receive isMetricSystem from parent component
type PersonalRecordsProps = {
  isMetricSystem: boolean | null;
};

const PersonalRecords: React.FC<PersonalRecordsProps> = ({ isMetricSystem }) => {
  // Track which rep count is selected
  const [selectedReps, setSelectedReps] = useState(1);
  // Store fetched PRs
  const [liftPRs, setLiftPRs] = useState<PR[]>([]);
  // Loading state
  const [loading, setLoading] = useState(true);
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Log when component receives props
  useEffect(() => {
   
  }, [isMetricSystem]);

  // Fetch personal records from API
  useEffect(() => {
    const fetchPersonalRecords = async () => {
      try {
       

        // Make the fetch request using authFetch
        const response = await authFetch(`${API_BASE_URL}/get-personal-records`, {
          credentials: "include", // This ensures cookies are sent with the request.
        });
        
       
        
        // Parse JSON from the response - this is the fix - authFetch returns a Response object, not parsed data
        const jsonData = await response.json();
       
        
        // Now check if the parsed data has success property
        if (jsonData && jsonData.success) {
         
          setLiftPRs(jsonData.data);
          setError(null);
        } else {
          // Handle case where the request succeeded but returned error status
          console.error("PersonalRecords: API returned error:", jsonData?.message || "Unknown error");
          throw new Error(jsonData?.message || "Failed to load personal records");
        }
      } catch (err) {
        // Handle any errors that occurred during fetch or parsing
        console.error("Error fetching personal records:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        // Set loading to false regardless of success or error
        setLoading(false);
       
      }
    };

    fetchPersonalRecords();
  }, []);

  // Create options for the select dropdown (1-30 reps)
  const repOptions = Array.from({ length: 30 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i + 1 === 1 ? 'Rep' : 'Reps'}`
  }));

  // Handle when user selects a new rep count
  const handleRepChange = (option: any) => {
   
    setSelectedReps(option.value);
  };

  // Helper function to convert kg to lbs
  const kgToLbs = (kg: number): number => {
    // 1 kg is approximately 2.20462 lbs
    return kg * 2.20462;
  };

  // Helper function to format weight with proper units and rounding
  const formatWeight = (weightInKg: number): string => {
    // Data is stored in metric (kg), so convert to imperial if needed
    let displayWeight: number;
    const unit: string = isMetricSystem ? 'kg' : 'lbs';
    
    if (isMetricSystem) {
      // Keep as kg if user prefers metric
      displayWeight = weightInKg;
    } else {
      // Convert to lbs if user prefers imperial
      displayWeight = kgToLbs(weightInKg);
    }
    
    // Round to nearest integer
    const roundedWeight = Math.round(displayWeight);
    
   
    
    return `${roundedWeight} ${unit}`;
  };

  // Custom styles for React Select to match our theme
  const customStyles = {
    control: (base: any) => ({
      ...base,
      background: 'transparent',
      borderColor: 'white',
      cursor: 'pointer',
      padding: '0',
      fontSize: '12px',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      minWidth: '90px', // Set a minimum width
      width: 'fit-content', // Allow it to grow only as needed
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'white',
    }),
    menu: (base: any) => ({
      ...base,
      background: 'blue',
      border: '1px solid white',
      width: 'auto', // Make dropdown width match content
      minWidth: '100%', // Ensure dropdown isn't smaller than control
    }),
    option: (base: any, state: any) => ({
      ...base,
      background: state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'blue',
      color: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      whiteSpace: 'nowrap', // Prevent text wrapping
      padding: '8px 12px', // Comfortable padding for options
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      color: 'white',
      padding: '4px', // Reduce padding around the dropdown arrow
    }),
    container: (base: any) => ({
      ...base,
      width: 'auto', // Allow container to shrink to content
    }),
  };

  // Style for "Nothing to show" message as specified
  const noContentStyle = {
    display: 'flex',
    flex: "100%",
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontFamily: "Hoefler Text",
    fontSize: "2em",
    fontWeight: "500",
    fontStyle: "normal",
    width: "auto",
    height: "auto",
    background: "blue",
    borderRadius: ".3em",
    border: "solid 1px white",
    margin: ".3em"
  };

  // Check if we have any PRs
  const hasPRs = liftPRs.length > 0;

 
 

  return (
    <div className="chart-container">
      <div className="Chart-Header">
        <h1 className="chart-title">Personal Records</h1>
        <div className="Current-Month">
          {selectedReps} Rep Max Records
        </div>

        <div className="rep-selector">
          <Select
            value={repOptions.find(option => option.value === selectedReps)}
            onChange={handleRepChange}
            options={repOptions}
            styles={customStyles}
            isSearchable={false}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      </div>

      {hasPRs ? (
        // Display PR list if we have data
        <div className="pr-list">
          {liftPRs.map((pr, index) => {
            const currentPR = pr.records.find(r => r.reps === selectedReps);
            return (
              <div key={index} className="pr-item">
                <span className="lift-name">{pr.lift}</span>
                <span className={`weight-value ${!currentPR ? 'no-pr' : ''}`}>
                  {currentPR ? formatWeight(currentPR.weight) : 'No PR recorded'}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        // Display "Nothing to show" message if no PRs are available
        <div className="no-content-message" style={noContentStyle}>
          Nothing to show
        </div>
      )}
    </div>
  );
};

export default PersonalRecords;