// Calendar.tsx
import React, { useState, useEffect } from 'react';
import {  ArrowLeft, ArrowRight  } from 'lucide-react';
import './Calendar.css';

// Define the props interface for type safety
interface CalendarProps {
  onDateSelect: (date: Date) => void;  // Function to handle date selection
  initialSelectedDate: Date;  // Initial date passed from parent
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, initialSelectedDate }) => {
  // State for tracking the current month view
  const [currentDate, setCurrentDate] = useState(new Date());
  // State for tracking the selected date, initialized with the prop
  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate);

  // Helper function to get days in a month
  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Helper function to get first day of month
  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Updated generateDays function with type safety
  const generateDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    // Add the actual days
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => {
            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            setSelectedDate(newDate);
            onDateSelect(newDate);  // Call the parent's handler
          }}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button"><ArrowLeft  strokeWidth={3} /></button>
        <h2 className="current-month">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={nextMonth} className="nav-button"><ArrowRight strokeWidth={3} /></button>
      </div>

      <div className="weekday-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {generateDays()}
      </div>
    </div>
  );
};

export default Calendar;