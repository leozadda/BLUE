import React from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Onboard from "./onboard/Onboard";
import './Dashboard.css';
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  // Prevent right click
  const handleContextMenu = (e: React.MouseEvent) => {
    // Allow right-click only on input elements
    if (!(e.target as HTMLElement).matches('input, textarea, [contenteditable="true"]')) {
      e.preventDefault();
    }
  };

  return (
    <div className="Dashboard" onContextMenu={handleContextMenu}>
      <div className="Sidebar-Container">
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