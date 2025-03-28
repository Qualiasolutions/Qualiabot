import React, { useState, useEffect } from 'react';
import './App.css';

// Use existing logo
const botLogo = '/favicon-96x96.png';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Handle widget toggle
  const toggleWidget = () => {
    if (isOpen) {
      // Add closing animation
      document.querySelector('.widget-content')?.classList.add('closing');
      setTimeout(() => {
        setIsOpen(false);
        document.querySelector('.widget-content')?.classList.remove('closing');
      }, 300);
    } else {
      setIsOpen(true);
    }
  };

  // Handle minimize/maximize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Handle custom events from widget.js
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => {
      document.querySelector('.widget-content')?.classList.add('closing');
      setTimeout(() => {
        setIsOpen(false);
        document.querySelector('.widget-content')?.classList.remove('closing');
      }, 300);
    };
    const handleToggle = () => toggleWidget();
    
    document.addEventListener('qualiabot:open', handleOpen);
    document.addEventListener('qualiabot:close', handleClose);
    document.addEventListener('qualiabot:toggle', handleToggle);
    
    return () => {
      document.removeEventListener('qualiabot:open', handleOpen);
      document.removeEventListener('qualiabot:close', handleClose);
      document.removeEventListener('qualiabot:toggle', handleToggle);
    };
  }, [isOpen]);

  return (
    <div className={`widget-container ${isOpen ? 'open' : ''} ${isMinimized ? 'minimized' : ''}`}>
      <button 
        className="widget-toggle" 
        onClick={toggleWidget}
        aria-label="Toggle chat widget"
      >
        <img src={botLogo} alt="QualiaBot" className="widget-icon" />
      </button>

      <div className="widget-content">
        <div className="widget-header">
          <div className="widget-title">
            <img src={botLogo} alt="QualiaBot" className="widget-header-icon" />
            <span>QualiaBot</span>
          </div>
          <div className="widget-controls">
            <button 
              onClick={toggleMinimize}
              className="control-button minimize-button"
              aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
            >
              {isMinimized ? '□' : '_'}
            </button>
            <button 
              onClick={toggleWidget}
              className="control-button close-button"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="chat-frame">
          <iframe 
            src="https://chat.qualiasolutions.net/?embed=true" 
            title="Chat with QualiaBot"
            width="100%"
            height="100%"
            frameBorder="0"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
