import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';
import './RestTimes.css';

type Exercise = 'benchPress' | 'squats' | 'deadlifts' | 'pullUps' | 'shoulderPress';

const RestTimes = () => {
  const [selectedExercises, setSelectedExercises] = useState<Set<Exercise>>(
    new Set(['benchPress', 'squats', 'deadlifts', 'pullUps', 'shoulderPress'])
  );

  const data = [
    {
      exercise: 'Bench Press',
      id: 'benchPress',
      short: 60,
      medium: 90,
      long: 30
    },
    {
      exercise: 'Squats',
      id: 'squats',
      short: 90,
      medium: 120,
      long: 45
    },
    {
      exercise: 'Deadlifts',
      id: 'deadlifts',
      short: 120,
      medium: 150,
      long: 60
    },
    {
      exercise: 'Pull Ups',
      id: 'pullUps',
      short: 45,
      medium: 60,
      long: 30
    },
    {
      exercise: 'Shoulder Press',
      id: 'shoulderPress',
      short: 60,
      medium: 75,
      long: 30
    }
  ];

  const toggleExercise = (exercise: Exercise) => {
    const newSelected = new Set(selectedExercises);
    if (newSelected.has(exercise)) {
      if (newSelected.size > 1) { // Prevent deselecting last exercise
        newSelected.delete(exercise);
      }
    } else {
      newSelected.add(exercise);
    }
    setSelectedExercises(newSelected);
  };

  const axisStyle = {
    fontSize: '12px',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 400,
  };

  const filteredData = data.filter(item => 
    selectedExercises.has(item.id as Exercise)
  );

  return (
    <div className="time-container">
      <div className="time-header">
        <h1 className="time-title">Rest Times</h1>
        <div className="time-subtitle">
          Exercise Duration (seconds)
        </div>
        
        <div className="exercise-controls">
          {data.map(({ exercise, id }) => (
            <button
              key={id}
              onClick={() => toggleExercise(id as Exercise)}
              className={`exercise-button ${
                selectedExercises.has(id as Exercise) ? 'active' : ''
              }`}
            >
              {exercise}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={filteredData}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <XAxis
            dataKey="exercise"
            stroke="#FFFFFF"
            style={axisStyle}
            tick={{ fill: '#FFFFFF' }}
          />
          <YAxis
            stroke="#FFFFFF"
            style={axisStyle}
            tick={{ fill: '#FFFFFF' }}
            domain={[0, 'auto']}
            tickFormatter={(value) => `${value}s`}
          />
          <Bar 
            dataKey="short" 
            name="Short Rest" 
            stackId="a" 
            fill="#FFFFFF"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="medium" 
            name="Medium Rest" 
            stackId="a" 
            fill="#FFFFFF"
            opacity={0.7}
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="long" 
            name="Long Rest" 
            stackId="a" 
            fill="#FFFFFF"
            opacity={0.4}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RestTimes;