import React, { useState } from "react";
import "./MissedDays.css";
import CircleProgress from "./CircleProgress/CircleProgress";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";

// Define time range type for strict typing
type TimeRange = 'week' | 'month' | 'year';

// Interface for workout data structure
interface WorkoutPeriodData {
  planned: number;
  missed: number;
  period: string;
}

interface WorkoutData {
  [key: string]: WorkoutPeriodData;
}

const MissedDaysGraph = () => {
  // State for tracking selected time range
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // Sample data for different time periods
  const workoutData: WorkoutData = {
    week: {
      planned: 5,
      missed: 1,
      period: 'Oct 1-7, 2023'
    },
    month: {
      planned: 20,
      missed: 3,
      period: 'October 2023'
    },
    year: {
      planned: 240,
      missed: 35,
      period: '2023'
    }
  };

  // Calculate the actual attendance rate
  const currentData = workoutData[timeRange];
  const completedWorkouts = currentData.planned - currentData.missed;
  const attendanceRate = Math.round((completedWorkouts / currentData.planned) * 100);


  return (
    <div className="chart-container">
      <div className="Chart-Header">
        <h1 className="chart-title">Days Skipped</h1>
        <div className="Current-Month">
          {`${completedWorkouts}/${currentData.planned} Workouts Completed - ${currentData.period}`}
        </div>
        
        {/* Time range selector buttons */}
        <div className="time-range-buttons">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeRange(period as TimeRange)}
              className={`time-button ${timeRange === period ? 'active' : ''}`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Pass the calculated attendance rate */}
      <CircleProgress 
        percentage={attendanceRate} 
        size={200} // Optional: adjust this value to make circle bigger/smaller
      />

    </div>
  );
};

export default MissedDaysGraph;