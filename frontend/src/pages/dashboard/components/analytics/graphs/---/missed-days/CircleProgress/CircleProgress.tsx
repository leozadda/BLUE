import React from 'react';
import "./CircleProgress.css";

interface CircleProgressProps {
  percentage: number;
  size?: number;  // Optional size prop with default value
}

const CircleProgress: React.FC<CircleProgressProps> = ({ 
  percentage, 
  size = 130 // Default size
}) => {
  const radius = size * 0.4; // Proportional radius
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="circle-container">
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background Circle */}
        <circle 
          className="background-circle" 
          cx={size/2} 
          cy={size/2} 
          r={radius} 
        />

        {/* Progress Circle */}
        <circle
          className="progress-circle"
          cx={size/2}
          cy={size/2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />

        {/* Text Group */}
        <text 
          className="circle-text" 
          x="50%" 
          y="42%"
          style={{ fontSize: size * 0.15 }}
        >
          {percentage}%
        </text>
        <text 
          className="circle-subtext" 
          x="50%" 
          y="62%"
          style={{ fontSize: size * 0.08 }}
        >
          Attendance
        </text>
      </svg>
    </div>
  );
};

export default CircleProgress;