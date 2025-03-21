import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChartNoAxesGantt, ChartSpline, Dumbbell, CalendarDays, Ruler, Settings, Menu, X } from "lucide-react";
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // DEBUG: Log when component mounts/renders
  useEffect(() => {
    console.log("Sidebar component mounted/rendered");
    console.log("Initial isOpen state:", isOpen);
  }, []);

  // DEBUG: Track isOpen state changes
  useEffect(() => {
    console.log("isOpen state changed to:", isOpen);
    
    // DEBUG: Check if sidebar element actually toggles the 'open' class
    const sidebarElement = document.querySelector('.Sidebar');
    console.log("Sidebar element:", sidebarElement);
    console.log("Sidebar has 'open' class:", sidebarElement?.classList.contains('open'));
    
    // DEBUG: Check if CSS transform is applied
    if (sidebarElement) {
      const computedStyle = window.getComputedStyle(sidebarElement);
      console.log("Sidebar transform style:", computedStyle.transform);
    }
  }, [isOpen]);
  
  // DEBUG: Log window width on resize to check mobile breakpoints
  useEffect(() => {
    const handleResize = () => {
      console.log("Window width:", window.innerWidth);
      console.log("Is mobile view (width <= 768):", window.innerWidth <= 768);
    };
    
    // Log initial width
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log("Click detected on document");
      
      const sidebar = document.querySelector('.Sidebar');
      const hamburger = document.querySelector('.hamburger-button');
      
      // DEBUG: Check elements existence and event target
      console.log("Click target:", event.target);
      console.log("Sidebar element exists:", !!sidebar);
      console.log("Hamburger element exists:", !!hamburger);
      
      if (sidebar && hamburger) {
        const clickedSidebar = sidebar.contains(event.target as Node);
        const clickedHamburger = hamburger.contains(event.target as Node);
        
        console.log("Click was inside sidebar:", clickedSidebar);
        console.log("Click was on hamburger:", clickedHamburger);
        
        if (!clickedSidebar && !clickedHamburger) {
          console.log("Click was outside sidebar and hamburger - closing sidebar");
          setIsOpen(false);
        }
      }
    };
    
    console.log("Adding clickOutside event listener");
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      console.log("Removing clickOutside event listener");
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    console.log("Route changed to:", location.pathname);
    console.log("Closing sidebar due to route change");
    setIsOpen(false);
  }, [location.pathname]);
  
  // Helper function to check if a tab is active
  const isActive = (path: string) => {
    const active = location.pathname.includes(path);
    console.log(`Checking if ${path} is active:`, active);
    return active;
  };

  // Handle navigation and sidebar closing
  const handleNavigation = (path: string) => {
    console.log(`Navigation requested to: ${path}`);
    console.log("Current window width:", window.innerWidth);
    
    if (window.innerWidth <= 768) {  // Only close on mobile
      console.log("On mobile - closing sidebar");
      setIsOpen(false);
    } else {
      console.log("Not on mobile - keeping sidebar state");
    }
    
    console.log("Navigating to:", path);
    navigate(path);
  };

  // DEBUG: Check hamburger button styling
  useEffect(() => {
    const checkHamburgerStyling = () => {
      const hamburger = document.querySelector('.hamburger-button');
      
      if (hamburger) {
        const style = window.getComputedStyle(hamburger);
        console.log("Hamburger button styles:");
        console.log("- display:", style.display);
        console.log("- position:", style.position);
        console.log("- z-index:", style.zIndex);
        console.log("- top:", style.top);
        console.log("- left:", style.left);
        console.log("- width:", style.width);
        console.log("- height:", style.height);
        console.log("- background-color:", style.backgroundColor);
        console.log("- visibility:", style.visibility);
        console.log("- opacity:", style.opacity);
        
        // Check if anything might be covering it
        const rect = hamburger.getBoundingClientRect();
        console.log("Hamburger button position:", rect);
        
        // DEBUG: Check what element is at the hamburger position
        const elemAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
        console.log("Element at hamburger button position:", elemAtPoint);
        console.log("Is hamburger visible at its position:", elemAtPoint === hamburger);
      } else {
        console.error("Hamburger button not found in DOM!");
      }
    };
    
    // Run this check after a small delay to ensure styles are applied
    setTimeout(checkHamburgerStyling, 500);
    
    // Also run on window resize
    window.addEventListener('resize', checkHamburgerStyling);
    return () => {
      window.removeEventListener('resize', checkHamburgerStyling);
    };
  }, []);
  
  // DEBUG: Log whenever hamburger is clicked (or attempted to be clicked)
  const handleHamburgerClick = () => {
    console.log("Hamburger button clicked");
    console.log("Current isOpen state:", isOpen);
    console.log("Setting isOpen to:", !isOpen);
    setIsOpen(!isOpen);
    
    // Force layout detection
    setTimeout(() => {
      const sidebar = document.querySelector('.Sidebar');
      console.log("Sidebar has 'open' class after click:", sidebar?.classList.contains('open'));
      
      if (sidebar) {
        const computedStyle = window.getComputedStyle(sidebar);
        console.log("Sidebar transform after click:", computedStyle.transform);
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
        console.log(`Click detected at position X:${x} Y:${y}`);
        
        // Check what element was actually clicked
        const clickedElem = document.elementFromPoint(x, y);
        console.log("Element clicked:", clickedElem);
        console.log("Element class list:", clickedElem?.classList);
        
        // Check if hamburger button exists and its position
        const hamburger = document.querySelector('.hamburger-button');
        if (hamburger) {
          const rect = hamburger.getBoundingClientRect();
          console.log("Hamburger position:", rect);
          console.log("Click inside hamburger bounds:", 
            x >= rect.left && x <= rect.right && 
            y >= rect.top && y <= rect.bottom
          );
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
        onMouseEnter={() => console.log("Mouse entered hamburger button")}
        onMouseDown={() => console.log("Mouse down on hamburger button")}
      >
        {isOpen ? 
          <X size={30} onClick={() => console.log("X icon clicked")} /> : 
          <ChartNoAxesGantt size={30} onClick={() => console.log("Menu icon clicked")} />
        }
      </div>
      
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => {
            console.log("Overlay clicked, closing sidebar");
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