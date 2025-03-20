import React, { useState, useEffect } from "react";
import { authFetch } from "../../../../../../auth/token/authFetch";
import "./MuscleVolume.css";
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

type TimeRange = 'week' | 'month' | 'year';
// Make the MuscleGroup type a string to handle any muscle group dynamically
type MuscleGroup = string;

// Keep VolumeData type dynamic using Record to handle any muscle group
type VolumeData = Record<string, number>; // Ensures all properties are numbers
type VolumeEntry = VolumeData & { date: string }; // Adds date separately


// API response will be an array of records
type ApiVolumeRecord = {
  period_type: string;
  period: string;
  body_part: string;
  net_total_volume: number;
};

// Dynamic muscle colors using a white default
const muscleColors: Record<string, string> = {
  chest: 'white',
  back: 'white',
  legs: 'white',
  shoulders: 'white',
  arms: 'white'
};

// Simplified mapping function that converts to lowercase and replaces spaces with underscores
const normalizeBodyPart = (bodyPart: string): string => {
  return bodyPart.toLowerCase().replace(/\s+/g, '_');
};

const getDayName = (dateStr: string) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

const getMonthName = (dateStr: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(dateStr);
  return months[date.getMonth()];
};

// Format tooltip date in a human-readable way - same as in MuscleSize
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


const axisStyle = {
  fontSize: '12px',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontWeight: 400,
};

// Custom tooltip component matching the MuscleSize tooltip
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
              {entry.value !== undefined ? `${entry.name}: ${entry.value.toFixed(1)}` : `${entry.name}: N/A`}
            </p>

        ))}
      </div>
    );
  }

  return null;
};

const MuscleVolume = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [availableMuscles, setAvailableMuscles] = useState<MuscleGroup[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<Set<MuscleGroup>>(new Set([]));
  const [volumeData, setVolumeData] = useState<Record<TimeRange, VolumeData[]>>({
    week: [], 
    month: [], 
    year: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to transform API data into the format our component expects
  const transformApiData = (apiData: ApiVolumeRecord[]): Record<TimeRange, VolumeData[]> => {
   
    
    // Initialize empty result structure
    const result: Record<TimeRange, VolumeData[]> = {
      week: [],
      month: [],
      year: []
    };
    
    // Group data by period_type (day/week/month) and period (timestamp)
    const groupedByPeriod: Record<string, Record<string, Record<string, number>>> = {};
    
    // Map API period_type to our TimeRange type
    const periodTypeMap: Record<string, TimeRange> = {
      'day': 'week',    // daily data for the week view
      'week': 'month',  // weekly data for the month view 
      'month': 'year'   // monthly data for the year view
    };
    
    // Track all unique muscle groups
    const uniqueMuscleGroups = new Set<string>();
    
    // First, group the data
    apiData.forEach(record => {
      const timeRange = periodTypeMap[record.period_type];
      if (!timeRange) {
       
        return;
      }
      
      const period = record.period;
      const muscleGroup = normalizeBodyPart(record.body_part);
      
      // Add to our list of unique muscle groups
      uniqueMuscleGroups.add(muscleGroup);
      
      if (!groupedByPeriod[timeRange]) {
        groupedByPeriod[timeRange] = {};
      }
      
      if (!groupedByPeriod[timeRange][period]) {
        groupedByPeriod[timeRange][period] = {};
      }
      
      // Initialize with 0 if not already set
      if (!groupedByPeriod[timeRange][period][muscleGroup]) {
        groupedByPeriod[timeRange][period][muscleGroup] = 0;
      }
      
      groupedByPeriod[timeRange][period][muscleGroup] = parseFloat(record.net_total_volume as any);
    });
    
    // Update available muscles
    setAvailableMuscles(Array.from(uniqueMuscleGroups));
    
    // If no muscles selected yet, select the first one
    if (selectedMuscles.size === 0 && uniqueMuscleGroups.size > 0) {
      setSelectedMuscles(new Set([Array.from(uniqueMuscleGroups)[0]]));
    }
    
    // Then, convert grouped data to array format
// Convert grouped data to array format
Object.entries(groupedByPeriod).forEach(([timeRange, periodData]) => {
  result[timeRange as TimeRange] = Object.entries(periodData)
    .map(([period, muscleData]) => ({
      date: period, // Keep date as a string
      ...muscleData, // Spread only valid number properties
    }) as VolumeEntry) // Explicitly cast to the correct type
    .filter(entry => Object.keys(entry).some(key => key !== "date")) // Ensure at least one volume key
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});


    
   
    return result;
  };

  // Fetch volume data from API
  const fetchVolumeData = async () => {
    // In fetchVolumeData function:
    try {
      const response = await authFetch(`${API_BASE_URL}/muscle-volume-history`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const apiData = await response.json();
      
      // Transform API data into our component's expected format
      const transformedData = transformApiData(apiData);
      
      // Always update state with whatever data we have
      setVolumeData(transformedData);
      setIsLoading(false); // Set loading to false after data is fetched
    } catch (err) {
      console.error('Error fetching muscle volume data:', err);
      setError('Failed to fetch data. Please try again later.');
      setIsLoading(false); // Don't forget to set loading to false on error
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchVolumeData();
  }, []); // Keep empty if you only want it to run once on mount

  const toggleMuscle = (muscle: MuscleGroup) => {
    const newSelected = new Set(selectedMuscles);
    if (newSelected.has(muscle)) {
      newSelected.delete(muscle); // Always allow deselection
    } else {
      newSelected.add(muscle);
    }
    setSelectedMuscles(newSelected);
  };

  const formatXAxis = (dateStr: string) => {
   
    switch(timeRange) {
      case 'week':
        return getDayName(dateStr);
      case 'month':
        return `Week ${Math.ceil(new Date(dateStr).getDate() / 7)}`;
      case 'year':
        return getMonthName(dateStr);
    }
  };

  const getPeriodTitle = () => {
    switch(timeRange) {
      case 'week':
        return 'Weekly View';
      case 'month':
        return 'Monthly View';
      case 'year':
        return 'Yearly View';
    }
  };

  // Get current data based on selected time range
  const data = volumeData[timeRange] || [];
 
  
  // Check if there's data to display
  const hasDataToDisplay = data.length > 0;
 

  return (
    <div className="chart-container">
      <div className="Chart-Header">
        <h1 className="chart-title">Muscle Volume Tracking</h1>
        <div className="Current-Month">
          {getPeriodTitle()}
        </div>
        
        <div className="time-range-controls">
          {(['week', 'month', 'year'] as TimeRange[]).map((period) => (
            <button
              key={period}
              onClick={() => setTimeRange(period)}
              className={`time-range-button ${timeRange === period ? 'active' : ''}`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        <div className="muscle-group-controls">
          {availableMuscles.map((muscle) => (
            <button
              key={muscle}
              onClick={() => toggleMuscle(muscle)}
              className={`muscle-group-button ${muscle} ${selectedMuscles.has(muscle) ? 'active' : ''}`}
            >
              {muscle.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>
      
      {/* If there's no data to display, show "Nothing to show" message */}
      {!hasDataToDisplay ? (
        <div 
          className="no-data-message" 
          style={{ 
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
            border: "1px solid rgba(255, 255, 255, 0.588) !important",
            margin: ".3em"
          }}
        >
          Nothing to show
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            onMouseMove={(e) => {
              if (e && e.activePayload) {
               
              }
            }}
          >
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              stroke="#FFFFFF"
              style={axisStyle}
              tick={{ fill: '#FFFFFF' }}
            />

            <YAxis 
              stroke="#FFFFFF"
              domain={['auto', 'auto']}
              tickFormatter={(value) => Math.round(value).toString()}
              style={axisStyle}
              tick={{ fill: '#FFFFFF' }}
            />

            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: 'white', strokeWidth: 1, strokeDasharray: '3 3' }}
            />

            {Array.from(selectedMuscles).map((muscle) => (
              <Line
                key={muscle}
                type="monotone"
                name={muscle.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                dataKey={muscle}
                stroke="white"
                strokeWidth={2}
                dot={{ 
                  stroke: 'white', 
                  strokeWidth: 2, 
                  r: 2, 
                  fill: 'white' 
                }}
                activeDot={{ 
                  r: 6, 
                  fill: 'white',
                  stroke: 'white',
                  strokeWidth: 2,
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

export default MuscleVolume;