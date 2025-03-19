// MuscleRecoveryGraph.js
// This component visualizes muscle recovery status for different muscle groups
// It shows recovery percentages with the same styling as your existing blue and white UI

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../../../../../auth/token/authFetch';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import './MuscleRecovery.css';
import { useAuth } from '../../../../../../auth/auth-context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface TooltipProps {
  active?: boolean;
  payload?: { payload: any }[];
  label?: string;
}

interface MuscleRecoveryData {
  muscle_group: string;
  recovery_percentage: number | null;
  last_trained_date?: string;
  days_since_trained?: number | null;
  recovery_rate?: number;
}



// Custom tooltip component that matches your MuscleSize.tsx tooltip style exactly
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  const formatDaysSince = (value: number | null | undefined): string => {
    return value !== null && value !== undefined && !isNaN(value)
      ? Number(value).toFixed(1)
      : 'N/A';
  };

  const formatTooltipDate = (muscleGroup: string | undefined): string => {
    if (!muscleGroup) return 'Unknown Muscle';
    return muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1);
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '.3em', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '12px', color: 'blue' }}>
      <p style={{ margin: 0, fontWeight: 'bold' }}>{formatTooltipDate(data.muscle_group)}</p>
      <p style={{ margin: 0 }}>Recovery: {data.recovery_percentage?.toFixed(1) || 0}%</p>
      {data.last_trained_date && <p style={{ margin: 0 }}>Last Trained: {new Date(data.last_trained_date).toLocaleDateString()}</p>}
      {data.days_since_trained !== undefined && <p style={{ margin: 0 }}>Days Since: {formatDaysSince(data.days_since_trained)}</p>}
      {data.recovery_rate !== undefined && <p style={{ margin: 0 }}>Recovery Rate: {data.recovery_rate?.toFixed(2) || 'N/A'}</p>}
    </div>
  );
};


// Custom styles for the axis to match your existing styling
const axisStyle = {
  fontSize: '12px',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontWeight: 400,
};

const MuscleRecoveryGraph = () => {
  // State to store the muscle recovery data
  const [recoveryData, setRecoveryData] = useState([]);
  // State to track loading status
  const [loading, setLoading] = useState(true);
  // State to track any errors
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch muscle recovery data
    const fetchRecoveryData = async () => {
      
      try {
        
        // Make fetch request with authorization header
        const response = await authFetch(`${API_BASE_URL}/muscle-recovery-status`, {
          method: 'GET',
          credentials: "include", // This ensures cookies are sent with the request.
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
       
        if (data && data.success) {
          // Filter out entries with null recovery percentage AND entries that are 100% recovered
          // This is the main change - we're now filtering out any muscle groups that are fully recovered
          const filteredData = data.data.filter((item: MuscleRecoveryData) => 
            item.recovery_percentage !== null && 
            item.recovery_percentage < 100
          );
          
          // Ensure all numeric values are actual numbers to prevent errors
          const safeData = filteredData.map((item: MuscleRecoveryData) => ({
            ...item,
            recovery_percentage: Number(item.recovery_percentage),
            days_since_trained: item.days_since_trained !== null ? Number(item.days_since_trained) : null,
            recovery_rate: Number(item.recovery_rate)
          }));
          
          
          
          setRecoveryData(safeData);
        } else {
          console.error('API returned unsuccessful response:', data);
          setError('Failed to load recovery data');
        }
      } catch (err) {
        console.error('Error fetching recovery data:', err);
      
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error fetching recovery data');
        }
      }
       finally {
        // Set loading to false regardless of success or failure
        setLoading(false);
       
      }
    };
    // Call the fetch function when component mounts
    fetchRecoveryData();
  }, []); // Empty array means this effect runs once on mount

  // Check if there's no data to display
  const noDataToShow = recoveryData.length === 0 && !loading;

  return (
    <div className="recovery-container">
      <div className="recovery-header">
        <h1 className="recovery-title">Muscle Recovery Status</h1>
        <div className="recovery-subtitle">
          Recovery Percentage (Showing only muscles that need recovery)
        </div>
      </div>

      {/* Display "Nothing to show" message when there's no data */}
      {noDataToShow ? (
        <div className="recovery-empty-state" style={{
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
        }}>
          Nothing to show
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={recoveryData}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            onMouseMove={(e) => {
              if (e && e.activePayload) {
               
              }
            }}
          >
            <XAxis
              dataKey="muscle_group"
              stroke="#FFFFFF"
              style={axisStyle}
              tick={{ fill: '#FFFFFF' }}
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <YAxis
              stroke="#FFFFFF"
              style={axisStyle}
              tick={{ fill: '#FFFFFF' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Bar
              dataKey="recovery_percentage"
              name="Recovery"
              fill="white"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MuscleRecoveryGraph;