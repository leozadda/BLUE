import React, { useState, useEffect } from "react";
import { authFetch } from "../../../../../../auth/token/authFetch";
import "./BodyWeightGraph.css"; // DO NOT change this import as it points to your existing styles
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

// Define the shape of each weight data record
type WeightData = {
  date: string;   // expected to be in "YYYY-MM-DD" format
  weight: number; // the recorded body weight value
};

// Define the shape of the API response
type ApiResponse = {
  week: WeightData[];
  month: WeightData[];
  year: WeightData[];
};

// Define props interface to accept isMetricSystem from parent component
interface BodyWeightGraphProps {
  isMetricSystem: boolean | null;
}

/*
  Helper function to get the day name (e.g. Sun, Mon) from a date string.
  This is used for the x-axis when the time range is set to 'week'.
*/
const getDayName = (dateStr: string) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

/*
  Helper function to get the month name (e.g. Jan, Feb) from a date string.
  This is used for the x-axis when the time range is set to 'year'.
*/
const getMonthName = (dateStr: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(dateStr);
  return months[date.getMonth()];
};

/*
  Helper function to format dates for the week view to show only the day of the month.
  Used for month view to simplify the x-axis labels.
*/
const getWeekLabel = (dateStr: string) => {
  // For the weekly view (within month), use a simple "Week X" format
  const date = new Date(dateStr);
  // Get the day of the month from the date string
  return "Week " + Math.ceil(date.getDate() / 7);
};

/*
  Helper function to convert weight from kg to lbs
  1 kg = 2.20462 lbs
*/
const kgToLbs = (weightInKg: number): number => {
  return weightInKg * 2.20462;
};

/*
  Custom styles for the axis text.
  These styles are applied to both the XAxis and YAxis.
*/
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
        <p style={{ margin: 0 }}>{`Weight: ${Math.floor(payload[0].value ?? 0)}`}</p>
      </div>
    );
  }

  return null;
};

/*
  Helper function to format the date in the tooltip in a human-readable way.
  This displays the date in a more detailed format than the axis labels.
*/
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

const BodyWeightGraph: React.FC<BodyWeightGraphProps> = ({ isMetricSystem }) => {
  // State to store the currently selected time range (week, month, or year)
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  // State to store all fetched weight data from the API
  const [allWeightData, setAllWeightData] = useState<ApiResponse | null>(null);
  // State to track if data is still loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to store any error message during fetching
  const [error, setError] = useState<string | null>(null);

 

  /*
    Function to fetch weight data from the API.
    Now fetches all three time ranges at once and stores them in state.
  */
  const fetchWeightData = async () => {
   
    setIsLoading(true);
    setError(null);
    
    try {
     
      // Call the API without any time range parameter, as the new API returns all ranges
      const response = await authFetch(`${API_BASE_URL}/get-bodyweight-history`, {
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
      setAllWeightData(result);
     
    } catch (err) {
      console.error('Error fetching bodyweight data:', err);
      setError('Failed to load data. Using sample data instead.');
      //error
     
    }
  };

  // Fetch all weight data when component mounts
  useEffect(() => {
   
    fetchWeightData();
  }, []);
  
  // Compute which data set to use based on the selected time range and available data
  // And convert to lbs if user is not using metric system
  const getCurrentData = (): WeightData[] => {
   
    
    let data: WeightData[] = [];
    
    if (allWeightData && allWeightData[timeRange] && allWeightData[timeRange].length > 0) {
     
      data = allWeightData[timeRange];
    } else {
     
    }
    
    // If not using metric system (isMetricSystem is false), convert kg to lbs
    if (isMetricSystem === false) {
     
      return data.map(item => ({
        ...item,
        weight: kgToLbs(item.weight)
      }));
    }
    
    // Return original data if using metric system
    return data;
  };
  
  // Get the current data based on the selected time range
  const data = getCurrentData();

  // Check if there's data to display
  const hasData = data && data.length > 0;
 

  /*
    This function formats the labels for the x-axis based on the selected time range.
    For week view: returns day names (Sun, Mon, etc.)
    For month view: returns "Week X" based on the day of the month.
    For year view: returns month names.
  */
  const formatXAxis = (dateStr: string) => {
   
    
    switch(timeRange) {
      case 'week':
        const dayName = getDayName(dateStr);
       
        return dayName;
      case 'month':
        const weekLabel = getWeekLabel(dateStr);
       
        return weekLabel;
      case 'year':
        const monthName = getMonthName(dateStr);
       
        return monthName;
      default:
        return dateStr;
    }
  };

  /*
    Helper function to return the period title based on the selected time range.
  */
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

  return (
    <div className="chart-container">
      <div className="Chart-Header">
        <h1 className="chart-title">Body Weight ({getWeightUnit()})</h1>
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
      </div>

      {/* Display "Nothing to show" message if there is no data */}
      {!hasData ? (
        <div className="no-data-message" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'auto',
          color: 'white',
          fontFamily: "Hoefler Text",
          fontSize: "2em",
          fontWeight: "500",
          fontStyle: "normal",
        }}>
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
            {/* XAxis uses the formatted labels based on time range */}
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              stroke="#FFFFFF"
              style={axisStyle}
              tick={{ fill: '#FFFFFF' }}
            />

            {/* YAxis for the weight values */}
            <YAxis 
              stroke="#FFFFFF"
              domain={['auto', 'auto']}
              tickFormatter={(value: any) => value.toString()}
              style={axisStyle}
              tick={{ fill: '#FFFFFF' }}
            />

            {/* Custom tooltip component that appears on hover */}
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: 'white', strokeWidth: 1, strokeDasharray: '3 3' }}
            />

            {/* Draw the line representing weight */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#FFFFFF"
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
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BodyWeightGraph;