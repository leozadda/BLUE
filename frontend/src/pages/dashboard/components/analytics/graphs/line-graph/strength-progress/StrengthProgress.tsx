import React, { useState, useEffect } from "react";
import { authFetch } from "../../../../../../auth/token/authFetch";
import "./StrengthProgress.css";
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

// Define type for time range
type TimeRange = 'week' | 'month' | 'year';

// Define interface for API data structure
interface StrengthHistoryItem {
  period_type: string;
  period: string;
  body_part: string;
  total_effective_weight: number;
}

// Define structure for processed data suitable for the chart
// Now using Record<string, number> instead of specific muscle properties
interface StrengthData {
  date: string;
  [key: string]: string | number; // Dynamic property for any body part
}

// Define props interface to accept isMetricSystem from parent component
interface StrengthProgressProps {
  isMetricSystem: boolean | null;
}

// Helper function to get day name from date string
const getDayName = (dateStr: string) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

// Helper function to get month name from date string
const getMonthName = (dateStr: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(dateStr);
  return months[date.getMonth()];
};

// Helper function to convert weight from kg to lbs
// 1 kg = 2.20462 lbs
const kgToLbs = (weightInKg: number): number => {
  return weightInKg * 2.20462;
};

// Define consistent styles for chart axes
const axisStyle = {
  fontSize: '12px',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontWeight: 400,
};

// Custom tooltip component for the chart
const CustomTooltip: React.FC<TooltipProps<number, string> & { weightUnit: string }> = ({
  active,
  payload,
  label,
  weightUnit,
}) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'rgb(255, 255, 255)', 
        border: '0px solid white',
        padding: '10px',
        borderRadius: '5px',
        color: 'blue',
        fontSize: '12px',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ margin: '3px 0', color: entry.color }}>
            {`${entry.name}: ${Number(entry.value).toFixed(1)} ${weightUnit}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const StrengthProgress: React.FC<StrengthProgressProps> = ({ isMetricSystem }) => {
  // State to store the currently selected time range
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  
  // State to store all available muscle groups (dynamically populated from API data)
  const [availableBodyParts, setAvailableBodyParts] = useState<string[]>([]);
  
  // State to store selected body parts to display on the chart
  const [selectedBodyParts, setSelectedBodyParts] = useState<Set<string>>(new Set([]));
  
  // State to store body part colors (populated dynamically)
  const [bodyPartColors, setBodyPartColors] = useState<Record<string, string>>({});
  
  // State to store all fetched strength data from the API
  const [strengthData, setStrengthData] = useState<{
    week: StrengthData[];
    month: StrengthData[];
    year: StrengthData[];
  } | null>(null);
  
  // State to track if data is still loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // State to store any error message during fetching
  const [error, setError] = useState<string | null>(null);

 

  // Function to fetch strength history data from the API
  const fetchStrengthData = async () => {
   
    setIsLoading(true);
    setError(null);
    
    try {
     
      // Call the API to get strength history
      const response = await authFetch(`${API_BASE_URL}/get-strength-history`, {
        credentials: "include", // This ensures cookies are sent with the request.
      });
     
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      // Parse the JSON response
      const result: StrengthHistoryItem[] = await response.json();
     
      
      // Process the API data into the format needed for the chart
      const processedData = processApiData(result);
      setStrengthData(processedData.data);
      
      // Set available body parts from the processed data
      setAvailableBodyParts(processedData.bodyParts);
     
      
      // Initialize selected body parts with the first one if none selected
      if (selectedBodyParts.size === 0 && processedData.bodyParts.length > 0) {
        // Pre-select all body parts - set multiple selections by default
        const initialSelection = new Set(processedData.bodyParts);
        setSelectedBodyParts(initialSelection);
      }
      
      // Set colors for each body part (all white as per original design)
      const colors: Record<string, string> = {};
      processedData.bodyParts.forEach(part => {
        colors[part] = 'blue';
      });
      setBodyPartColors(colors);
     
      
     
    } catch (err) {
      console.error('Error fetching strength data:', err);
     
    } finally {
      setIsLoading(false);
    }
  };

  // Function to process the API data into the format needed for the chart
  // Maps the API response to the proper structure for each time range
  const processApiData = (apiData: StrengthHistoryItem[]) => {
   
    
    // Create maps to store aggregated data for each time period
    const dailyData = new Map<string, Record<string, number | string>>();
    const weeklyData = new Map<string, Record<string, number | string>>();
    const monthlyData = new Map<string, Record<string, number | string>>();
    
    // Keep track of all unique body parts
    const uniqueBodyParts = new Set<string>();
    
    // Process each data point from the API
    apiData.forEach(item => {
      // Format the date to use as a key
      const dateKey = new Date(item.period).toISOString().split('T')[0];
      
      // Normalize the body part name (lowercase, trim)
      const bodyPart = item.body_part.toLowerCase().trim();
      
      // Add to unique body parts set
      uniqueBodyParts.add(bodyPart);
     
      
      // Get the appropriate Map based on period_type
      let targetMap: Map<string, Record<string, number | string>>;
      switch(item.period_type) {
        case 'day':
          targetMap = dailyData;
          break;
        case 'week':
          targetMap = weeklyData;
          break;
        case 'month':
          targetMap = monthlyData;
          break;
        default:
         
          return; // Skip this data point if we can't map it
      }
      
      // Initialize the entry if it doesn't exist
      if (!targetMap.has(dateKey)) {
        targetMap.set(dateKey, { date: dateKey });
      }
      
      // Add the strength value to the appropriate body part
      const entry = targetMap.get(dateKey)!;
      entry[bodyPart] = item.total_effective_weight;
    });
    

    
    // Convert Maps to sorted arrays and ensure all entries have all body parts
    const convertMapToSortedArray = (map: Map<string, Record<string, number | string>>) => {
      return Array.from(map.values())
        .sort((a, b) => String(a.date).localeCompare(String(b.date)))
        .map(item => {
          // Ensure all body parts have a value (default to 0)
          const result: Record<string, number | string> = { date: item.date };
          
          uniqueBodyParts.forEach(bodyPart => {
            result[bodyPart] = item[bodyPart] !== undefined ? item[bodyPart] : 0;
          });
          
          return result as StrengthData;
        });
    };
    
    // Convert each map to a sorted array
    const week = convertMapToSortedArray(dailyData);
    const month = convertMapToSortedArray(weeklyData);
    const year = convertMapToSortedArray(monthlyData);
    
    // Return the processed data and body parts
    return {
      data: { week, month, year },
      bodyParts: Array.from(uniqueBodyParts)
    };
  };

  // Fetch strength data when component mounts
  useEffect(() => {
   
    fetchStrengthData();
  }, []);

  // Function to toggle a body part selection on/off
  const toggleBodyPart = (bodyPart: string) => {
   
    const newSelected = new Set(selectedBodyParts);
    
    if (newSelected.has(bodyPart)) {
      // Ensure we always have at least one body part selected
      if (newSelected.size > 1) {
        newSelected.delete(bodyPart);
       
      } else {
       
      }
    } else {
      newSelected.add(bodyPart);
     
    }
    
    setSelectedBodyParts(newSelected);
  };

  // Get the current data based on the selected time range and convert units if needed
  const getCurrentData = (): StrengthData[] => {
   
    
    let data: StrengthData[] = [];
    
    if (strengthData && strengthData[timeRange] && strengthData[timeRange].length > 0) {
     
      data = strengthData[timeRange];
    } else {
     
    }
    
    // If not using metric system (isMetricSystem is false), convert kg to lbs
    if (isMetricSystem === false) {
     
      return data.map(item => {
        const convertedItem: StrengthData = { date: item.date };
        
        // Convert only numeric properties (excluding date)
        Object.entries(item).forEach(([key, value]) => {
          if (key !== 'date' && typeof value === 'number') {
            convertedItem[key] = kgToLbs(value);
          } else if (key !== 'date') {
            convertedItem[key] = value;
          }
        });
        
        return convertedItem;
      });
    }
    
    // Return original data if using metric system
    return data;
  };

  // Format X-axis labels based on the selected time range
  const formatXAxis = (dateStr: string) => {
   
    
    switch(timeRange) {
      case 'week':
        return getDayName(dateStr);
      case 'month':
        return `Week ${Math.ceil(new Date(dateStr).getDate() / 7)}`;
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

  // Get the appropriate weight unit based on the user's preference
  const getWeightUnit = () => {
    return isMetricSystem ? 'kg' : 'lbs';
  };

  // Get the data to be displayed
  const data = getCurrentData();
  // Check if we have data to display
  const hasData = data && data.length > 0;

  return (
    <div className="chart-container">
      <div className="Chart-Header">
        <h1 className="chart-title">Strength Progress ({getWeightUnit()})</h1>
        <div className="Current-Month">
          {getPeriodTitle()}
        </div>
        
        <div className="time-range-controls">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => {
               
                setTimeRange(period as TimeRange);
              }}
              className={`time-range-button ${timeRange === period ? 'active' : ''}`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        <div className="muscle-group-controls">
          {availableBodyParts.map((bodyPart) => (
            <button
              key={bodyPart}
              onClick={() => toggleBodyPart(bodyPart)}
              className={`muscle-group-button ${bodyPart} ${selectedBodyParts.has(bodyPart) ? 'active' : ''}`}
            >
              {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Check if there's data to display and show the chart or "Nothing to show" message */}
      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
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
            
            {/* Add tooltip component with custom styling */}
            <Tooltip 
              content={<CustomTooltip weightUnit={getWeightUnit()} />} 
              cursor={{ stroke: 'white', strokeWidth: 1, strokeDasharray: '5 5' }}
            />

            {Array.from(selectedBodyParts).map((bodyPart) => (
              <Line
                key={bodyPart}
                type="monotone"
                dataKey={bodyPart}
                name={bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                stroke={bodyPartColors[bodyPart] || 'blue'}
                strokeWidth={2}
                dot={{ r: 3, fill: bodyPartColors[bodyPart] || 'blue', stroke: 'white', strokeWidth: 1 }}
                activeDot={{ r: 6, fill: bodyPartColors[bodyPart] || 'blue', stroke: 'white', strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        // Display "Nothing to show" message when no data is available
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
            border: "solid 1px white",
            margin: ".6em"
          }}
        >
          Nothing to show
        </div>
      )}
    </div>
  );
};

export default StrengthProgress;