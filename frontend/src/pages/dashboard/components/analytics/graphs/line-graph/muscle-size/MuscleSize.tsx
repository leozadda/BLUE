import React, { useState, useEffect } from "react";
import "./MuscleSize.css";
import { authFetch } from "../../../../../../auth/token/authFetch";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Define the possible time ranges as a TypeScript type
type TimeRange = 'week' | 'month' | 'year';

// Define the possible muscle groups to display
type MuscleGroup = 'arms' | 'thighs' | 'calves' | 'waist' | 'forearms' | 'chest';

// Define the shape of each muscle measurement data record
type MuscleData = {
  date: string;   // expected to be in "YYYY-MM-DD" format
  arms: number;
  thighs: number;
  calves: number;
  waist: number;
  forearms: number;
  chest: number;
};

// Define the shape of the API response
type ApiResponse = {
  week: MuscleData[];
  month: MuscleData[];
  year: MuscleData[];
};

// Define props interface to accept isMetricSystem from parent component
interface MuscleSizeProps {
  isMetricSystem: boolean | null;
}

// Color mapping for each muscle group line
const muscleColors: Record<MuscleGroup, string> = {
  arms: '#FFFFFF',     // White
  thighs: '#FFFFFF',   // White
  calves: '#FFFFFF',   // White
  waist: '#FFFFFF',    // White
  forearms: '#FFFFFF', // White
  chest: '#FFFFFF'     // White
};

// Helper function to get the day name (e.g. Sun, Mon) from a date string
const getDayName = (dateStr: string) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

// Helper function to get the month name (e.g. Jan, Feb) from a date string
const getMonthName = (dateStr: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(dateStr);
  return months[date.getMonth()];
};

// Helper function to format dates for the week view to show only the day of the month
const getWeekLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  // Get the week number within the month
  return "Week " + Math.ceil(date.getDate() / 7);
};

// Helper function to convert size from cm to inches
// 1 cm = 0.393701 inches
const cmToInches = (sizeInCm: number): number => {
  return sizeInCm * 0.393701;
};

// Format tooltip date in a human-readable way
const formatTooltipDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    // Format: "Month Day, Year" (e.g., "October 12, 2023")
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch (err) {
    console.error("Error formatting tooltip date:", err);
    return dateStr; // Return original string if parsing fails
  }
};


// Define consistent styles for chart axes
const axisStyle = {
  fontSize: '12px',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontWeight: 400,
};

// Custom tooltip component to match the existing UI style
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
   
    
    return (
      <div style={{ 
        backgroundColor: 'white', 
        padding: '10px', 
        border: '0px solid white',
        borderRadius: '.3em',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: '12px',
        color: 'blue'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{formatTooltipDate(label)}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} style={{ margin: 0 }}>
        {`${entry.name}: ${entry.value !== undefined ? entry.value.toFixed(1) : 'N/A'}`}
      </p>
))}

      </div>
    );
  }

  return null;
};

const MuscleSize: React.FC<MuscleSizeProps> = ({ isMetricSystem }) => {
  // State to store the currently selected time range (week, month, or year)
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  // State to store selected muscle groups to display on the chart
  const [selectedMuscles, setSelectedMuscles] = useState<Set<MuscleGroup>>(new Set(['arms']));
  // State to store all fetched muscle size data from the API
  const [allMuscleData, setAllMuscleData] = useState<ApiResponse | null>(null);
  // State to track if data is still loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to store any error message during fetching
  const [error, setError] = useState<string | null>(null);

 

  // Function to toggle a muscle group selection on/off
  const toggleMuscle = (muscle: MuscleGroup) => {
   
    const newSelected = new Set(selectedMuscles);
    if (newSelected.has(muscle)) {
      // Ensure we always have at least one muscle selected
      if (newSelected.size > 1) {
        newSelected.delete(muscle);
       
      } else {
       
      }
    } else {
      newSelected.add(muscle);
     
    }
    setSelectedMuscles(newSelected);
  };

  // Function to fetch muscle size data from the API
  const fetchMuscleData = async () => {
   
    setIsLoading(true);
    setError(null);
    
    try {
     
      // Call the API to get muscle size history
      const response = await authFetch(`${API_BASE_URL}/muscle-size-history`, {
        credentials: "include", // This ensures cookies are sent with the request.
      });
     
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      // Parse the JSON response
      const result = await response.json();
     
      
      // Check if the response has the expected structure
      if (!result.week || !result.month || !result.year) {
        console.error('Unexpected response format:', result);
        throw new Error('Response format does not include all required time ranges');
      }
      
      // Store all the data in state
      setAllMuscleData(result);
     
    } catch (err) {
      console.error('Error fetching muscle size data:', err);
      // error
     
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all muscle size data when component mounts
  useEffect(() => {
   
    fetchMuscleData();
  }, []);
  
  // Compute which data set to use based on the selected time range and available data
  // And convert to inches if user is not using metric system
  const getCurrentData = (): MuscleData[] => {
   
    
    let data: MuscleData[] = [];
    
    if (allMuscleData && allMuscleData[timeRange] && allMuscleData[timeRange].length > 0) {
     
      data = allMuscleData[timeRange];
    } else {
     
    }
    
    // If not using metric system (isMetricSystem is false), convert cm to inches
    if (isMetricSystem === false) {
     
      return data.map(item => ({
        ...item,
        arms: cmToInches(item.arms),
        thighs: cmToInches(item.thighs),
        calves: cmToInches(item.calves),
        waist: cmToInches(item.waist),
        forearms: cmToInches(item.forearms),
        chest: cmToInches(item.chest)
      }));
    }
    
    // Return original data if using metric system
    return data;
  };

  // Get the current data based on the selected time range
  const data = getCurrentData();

  // Format X-axis labels based on the selected time range
  const formatXAxis = (dateStr: string) => {
   
    
    switch(timeRange) {
      case 'week':
        return getDayName(dateStr);
      case 'month':
        return getWeekLabel(dateStr);
      case 'year':
        return getMonthName(dateStr);
      default:
        return dateStr;
    }
  };

  // Get the appropriate title based on the selected time range
  const getPeriodTitle = () => {
    switch(timeRange) {
      case 'week':
        return 'Weekly View';
      case 'month':
        return 'Monthly View';
      case 'year':
        return 'Yearly View';
      default:
        return '';
    }
  };

  // Get the appropriate measurement unit based on the user's preference
  const getSizeUnit = () => {
    return isMetricSystem ? 'cm' : 'in';
  };


  // Check if there's no data to display
  const hasNoData = !data || data.length === 0;
 

  return (
    <div className="chart-container">
      <div className="Chart-Header">
        <h1 className="chart-title">Muscle Size ({getSizeUnit()})</h1>
        <div className="Current-Month">
          {getPeriodTitle()}
        </div>
        
        {/* Time range selector buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '1rem',
          marginLeft: '0.5em'
        }}>
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => {
               
                setTimeRange(period as TimeRange);
              }}
              style={{
                background: timeRange === period ? 'white' : 'transparent',
                color: timeRange === period ? 'blue' : 'white',
                border: '1px solid white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Muscle group selector buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginTop: '1rem',
          marginLeft: '0.5em',
          flexWrap: 'wrap'
        }}>
          {Object.keys(muscleColors).map((muscle) => (
            <button
              key={muscle}
              onClick={() => toggleMuscle(muscle as MuscleGroup)}
              style={{
                background: selectedMuscles.has(muscle as MuscleGroup) ? 'white' : 'transparent',
                color: selectedMuscles.has(muscle as MuscleGroup) ? 'blue' : 'white',
                border: '1px solid white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {hasNoData ? (
        // Display "Nothing to show" when there's no data
        <div 
          className="no-data-container" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 'auto', 
            color: 'white', 
            fontFamily: "Hoefler Text", 
            fontSize: "2em", 
            fontWeight: "500", 
            fontStyle: "normal",
            minHeight: '300px' // Match the height of the chart container
          }}
        >
          Nothing to show
        </div>
      ) : (
        // Display chart when data is available
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            onMouseMove={(e) => {
              if (e && e.activePayload) {
               
              }
            }}
          >
            {/* XAxis uses the formatted labels based on time range */}
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              stroke="#FFFFFF"
              style={axisStyle}
              tick={{ fill: '#FFFFFF' }}
            />

            {/* YAxis for the muscle size values */}
            <YAxis 
              stroke="#FFFFFF"
              domain={['auto', 'auto']}
              tickFormatter={(value) => Math.round(value).toString()}
              style={axisStyle}
              tick={{ fill: '#FFFFFF' }}
            />

            {/* Custom tooltip component that appears on hover */}
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: 'white', strokeWidth: 1, strokeDasharray: '3 3' }}
            />

            {/* Draw a line for each selected muscle group */}
            {Array.from(selectedMuscles).map((muscle) => (
              <Line
                key={muscle}
                type="monotone"
                name={muscle}
                dataKey={muscle}
                stroke={muscleColors[muscle]}
                strokeWidth={2}
                dot={{ 
                  stroke: 'white', 
                  strokeWidth: 2, 
                  r: 2, 
                  fill: 'white' 
                }}
                activeDot={{ 
                  stroke: 'white', 
                  strokeWidth: 2, 
                  r: 6, 
                  fill: 'white',
                  onClick: (data, index) => {
                   
                  }
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MuscleSize;