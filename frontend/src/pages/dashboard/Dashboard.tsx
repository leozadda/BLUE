// In Dashboard.tsx
import React, { useState, useEffect } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Onboard from "./onboard/Onboard";
import './Dashboard.css';
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Add effect to listen for sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = () => {
      // Check if sidebar has 'open' class
      const sidebar = document.querySelector('.Sidebar');
      if (sidebar) {
        setIsSidebarOpen(sidebar.classList.contains('open'));
      }
    };
    
    // Set up a MutationObserver to watch for class changes on sidebar
    const sidebarElement = document.querySelector('.Sidebar');
    if (sidebarElement) {
      const observer = new MutationObserver(handleSidebarStateChange);
      observer.observe(sidebarElement, { attributes: true });
      
      // Initial check
      handleSidebarStateChange();
      
      return () => observer.disconnect();
    }
  }, []);
  
  // Prevent right click
  const handleContextMenu = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).matches('input, textarea, [contenteditable="true"]')) {
      e.preventDefault();
    }
  };

  return (
    <div className="Dashboard" onContextMenu={handleContextMenu}>
      <div 
        className="Sidebar-Container" 
        style={{
          position: window.innerWidth <= 768 ? 'fixed' : undefined,
          pointerEvents: window.innerWidth <= 768 && !isSidebarOpen ? 'none' : undefined
        }}
      >
        <Sidebar />
      </div>
      <div className="Main-Container">
        <Outlet />
      </div>
      <Onboard />
    </div>
  );
};

export default Dashboard;