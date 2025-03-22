import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChartNoAxesGantt, ChartSpline, Dumbbell, CalendarDays, Ruler, Settings, Menu, X } from "lucide-react";
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();


  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  // Helper function to check if a tab is active
  const isActive = (path: string) => {
    const active = location.pathname.includes(path);
    return active;
  };

  // Handle navigation and sidebar closing
  const handleNavigation = (path: string) => {
    
    if (window.innerWidth <= 768) {  // Only close on mobile
      setIsOpen(false);
    } 
    navigate(path);
  };

  
  // DEBUG: Log whenever hamburger is clicked (or attempted to be clicked)
  const handleHamburgerClick = () => {
    setIsOpen(!isOpen);
    // Force layout detection
    setTimeout(() => {
      const sidebar = document.querySelector('.Sidebar');
      if (sidebar) {
        const computedStyle = window.getComputedStyle(sidebar);
      }
    }, 100);
  };
  
  // DEBUG: Add a click event listener to the document to check if clicks are being captured
  useEffect(() => {
    const debugClickCapture = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      
      // Only log clicks in the top left corner where hamburger would be
      if (x < 60 && y < 60) {  
        // Check what element was actually clicked
        const clickedElem = document.elementFromPoint(x, y);
        
        // Check if hamburger button exists and its position
        const hamburger = document.querySelector('.hamburger-button');
        if (hamburger) {
          const rect = hamburger.getBoundingClientRect();
        }
      }
    };
    
    document.addEventListener('click', debugClickCapture, true);
    return () => {
      document.removeEventListener('click', debugClickCapture, true);
    };
  }, []);
  
  return (
    <>
      <div 
        className="hamburger-button" 
        onClick={handleHamburgerClick}
      >
        {isOpen ? 
          <X size={0} /> : 
          <ChartNoAxesGantt size={30} />
        }
      </div>
      
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => {
            setIsOpen(false);
          }}
        ></div>
      )}
      
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
              <p>Measure</p>
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