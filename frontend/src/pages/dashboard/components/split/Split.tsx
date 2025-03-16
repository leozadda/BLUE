// Split.tsx
import React, { useState } from 'react';
import './Split.css';
import DayPlanner from './day-planner/DayPlanner';
import Calendar from './calendar/Calendar';

const Split: React.FC = () => {
  // Create a state to store the selected date that will be shared between components
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // This function will be passed to Calendar component to update the date
  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  return (
    <div className="Split">
      <div className="Split-Grid">
        <div className="Calender-Grid">
          {/* Pass the state and handler to Calendar */}
          <Calendar 
            onDateSelect={handleDateChange} 
            initialSelectedDate={selectedDate}
          />
        </div>
        <div className="Day-Grid">
          {/* Pass the selected date to DayPlanner */}
          <DayPlanner date={selectedDate} />
        </div>
      </div>
    </div>
  );
};

export default Split;