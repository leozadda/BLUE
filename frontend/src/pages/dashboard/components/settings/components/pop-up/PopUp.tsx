import React from 'react';
import { X } from 'lucide-react';
import './Popup.css';

/**
 * Props for the Popup component
 */
interface PopupProps {
  title: string;               // Title displayed in the popup header
  content: React.ReactNode;    // Content to be rendered inside the popup
  onClose: () => void;         // Callback function when popup is closed
}

/**
 * A reusable popup/modal component that can display any content
 * with a standardized header and close button.
 */
const Popup: React.FC<PopupProps> = ({ title, content, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="popup-body">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Popup;