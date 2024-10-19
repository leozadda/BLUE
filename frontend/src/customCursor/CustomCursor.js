import React, { useState, useEffect } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updatePosition);

    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '10px',
        height: '10px',
        borderStyle: 'solid',
        borderColor: 'blue',
        borderWidth: '2px',
        borderRadius: '33%',
        backgroundColor: 'white',
        pointerEvents: 'none',
        transform: `translate(${position.x - 10}px, ${position.y - 10}px)`,
        zIndex: 9999,
      }}
    />
  );
};

export default CustomCursor;