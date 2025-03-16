import React from "react";
import "./GymTimeSpent.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";

type GymTimeData = {
  day: string;
  duration: number;
};

// Sample data - duration in minutes
const data: GymTimeData[] = [
  { day: "Mon", duration: 45 },
  { day: "Tue", duration: 60 },
  { day: "Wed", duration: 30 },
  { day: "Thu", duration: 75 },
  { day: "Fri", duration: 45 },
  { day: "Sat", duration: 90 },
  { day: "Sun", duration: 0 }
];

// Custom styles for the axis
const axisStyle = {
  fontSize: '12px',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontWeight: 400,
};

const GymTimeSpent = () => {
  return (
    <div className="time-container">
      <div className="time-header">
        <h1 className="time-title">Gym Time</h1>
        <div className="time-subtitle">
          Daily Duration (minutes)
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <XAxis
            dataKey="day"
            stroke="#FFFFFF"
            style={axisStyle}
            tick={{ fill: '#FFFFFF' }}
          />
          <YAxis
            stroke="#FFFFFF"
            style={axisStyle}
            tick={{ fill: '#FFFFFF' }}
            domain={[0, 'auto']}
            tickFormatter={(value) => `${value}m`}
          />
          <Bar
            dataKey="duration"
            fill="#FFFFFF"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GymTimeSpent;