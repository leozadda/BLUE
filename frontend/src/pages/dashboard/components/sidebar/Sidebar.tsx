import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChartSpline, Dumbbell, CalendarDays, Ruler, Settings, Menu, X } from "lucide-react";
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('.Sidebar');
      const hamburger = document.querySelector('.hamburger-button');
      
      if (sidebar && hamburger && 
          !sidebar.contains(event.target as Node) && 
          !hamburger.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  // Helper function to check if a tab is active
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  // Handle navigation and sidebar closing
  const handleNavigation = (path: string) => {
    if (window.innerWidth <= 768) {  // Only close on mobile
      setIsOpen(false);
    }
    navigate(path);
  };
  
  return (
    <>
      <div className="hamburger-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={30} /> : <Menu size={30} />}
      </div>
      
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
      
      <div className={`Sidebar ${isOpen ? 'open' : ''}`}>
        <div className="Company-Logo">
          <div onClick={() => handleNavigation("/")}><h1>B-L-U-E</h1></div>
        </div>
        <div className="Navigation-Tabs">
          <div onClick={() => handleNavigation("/dashboard/analytics")}>
            <div className={`Analytics-Tab ${isActive('/dashboard/analytics') ? 'active' : ''}`}>
              <ChartSpline />
              <p>Analytics</p>
            </div>
          </div>
          <div onClick={() => handleNavigation("/dashboard/lift")}>
            <div className={`Lifts-Tab ${isActive('/dashboard/lift') ? 'active' : ''}`}>
              <Dumbbell />
              <p>Lift</p>
            </div>
          </div>
          <div onClick={() => handleNavigation("/dashboard/split")}>
            <div className={`Split-Tab ${isActive('/dashboard/split') ? 'active' : ''}`}>
              <CalendarDays />
              <p>Split</p>
            </div>
          </div>
          <div onClick={() => handleNavigation("/dashboard/measure")}>
            <div className={`Measurements-Tab ${isActive('/dashboard/measure') ? 'active' : ''}`}>
              <Ruler />
              <p>Measurements</p>
            </div>
          </div>
        </div>
        <div onClick={() => handleNavigation("/dashboard/settings")}>
          <div className={`Settings-Button ${isActive('/dashboard/settings') ? 'active' : ''}`}>
            <Settings />
            <p>Settings</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;