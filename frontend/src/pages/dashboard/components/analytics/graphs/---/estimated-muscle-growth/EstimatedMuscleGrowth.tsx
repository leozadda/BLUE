import React, { useState } from "react";
import "./EstimatedMuscleGrowth.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

type TimeRange = 'week' | 'month' | 'year';
type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms';

type GrowthData = {
  date: string;
  chest: number;
  back: number;
  legs: number;
  shoulders: number;
  arms: number;
};

const muscleColors: Record<MuscleGroup, string> = {
  chest: 'white',
  back: 'white',
  legs: 'white',
  shoulders: 'white',
  arms: 'white'
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

// Sample data for estimated muscle growth (in percentage)
const sampleData = {
  week: [
    { date: "2023-10-01", chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0 },
    { date: "2023-10-02", chest: 0.2, back: 0.3, legs: 0.2, shoulders: 0.3, arms: 0.2 },
    { date: "2023-10-03", chest: 0.5, back: 0.5, legs: 0.5, shoulders: 0.5, arms: 0.4 },
    { date: "2023-10-04", chest: 0.3, back: 0.4, legs: 0.4, shoulders: 0.4, arms: 0.3 },
    { date: "2023-10-05", chest: 0.7, back: 0.7, legs: 0.7, shoulders: 0.7, arms: 0.6 },
    { date: "2023-10-06", chest: 1.0, back: 1.0, legs: 1.0, shoulders: 1.0, arms: 0.8 },
    { date: "2023-10-07", chest: 0.8, back: 0.8, legs: 0.8, shoulders: 0.8, arms: 0.7 },
  ],
  month: [
    { date: "2023-10-01", chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0 },
    { date: "2023-10-07", chest: 0.5, back: 0.5, legs: 0.5, shoulders: 0.5, arms: 0.5 },
    { date: "2023-10-14", chest: 1.0, back: 1.0, legs: 1.0, shoulders: 1.0, arms: 1.0 },
    { date: "2023-10-21", chest: 1.5, back: 1.5, legs: 1.5, shoulders: 1.5, arms: 1.5 },
    { date: "2023-10-28", chest: 2.0, back: 2.0, legs: 2.0, shoulders: 2.0, arms: 2.0 },
  ],
  year: [
    { date: "2023-01-01", chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0 },
    { date: "2023-03-01", chest: 2, back: 2, legs: 2, shoulders: 2, arms: 2 },
    { date: "2023-06-01", chest: 4, back: 4, legs: 4, shoulders: 4, arms: 4 },
    { date: "2023-09-01", chest: 6, back: 6, legs: 6, shoulders: 6, arms: 6 },
    { date: "2023-12-01", chest: 8, back: 8, legs: 8, shoulders: 8, arms: 8 },
  ],
};

const axisStyle = {
  fontSize: '12px',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontWeight: 400,
};

const EstimatedMuscleGrowth = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedMuscles, setSelectedMuscles] = useState<Set<MuscleGroup>>(new Set(['chest']));

  const data = sampleData[timeRange];

  const toggleMuscle = (muscle: MuscleGroup) => {
    const newSelected = new Set(selectedMuscles);
    if (newSelected.has(muscle)) {
      if (newSelected.size > 1) {
        newSelected.delete(muscle);
      }
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

  return (
    <div className="chart-container">
      <div className="Chart-Header">
        <h1 className="chart-title">Estimated Muscle Growth (%)</h1>
        <div className="Current-Month">
          {getPeriodTitle()}
        </div>
        
        <div className="time-range-controls">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeRange(period as TimeRange)}
              className={`time-range-button ${timeRange === period ? 'active' : ''}`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        <div className="muscle-group-controls">
          {Object.keys(muscleColors).map((muscle) => (
            <button
              key={muscle}
              onClick={() => toggleMuscle(muscle as MuscleGroup)}
              className={`muscle-group-button ${muscle} ${selectedMuscles.has(muscle as MuscleGroup) ? 'active' : ''}`}
            >
              {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
            </button>
          ))}
        </div>
      </div>

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
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            style={axisStyle}
            tick={{ fill: '#FFFFFF' }}
          />
          {Array.from(selectedMuscles).map((muscle) => (
            <Line
              key={muscle}
              type="monotone"
              dataKey={muscle}
              stroke={muscleColors[muscle]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: muscleColors[muscle] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EstimatedMuscleGrowth;