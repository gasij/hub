import React, { useEffect, useRef } from 'react';
import './InteractiveEffects.css';

const InteractiveEffects = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create floating elements
    const createFloatingElement = () => {
      const element = document.createElement('div');
      element.className = 'floating-element';
      
      // Random properties
      const size = Math.random() * 20 + 10;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight + 50;
      
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.left = `${startX}px`;
      element.style.top = `${startY}px`;
      element.style.animationDuration = `${duration}s`;
      element.style.animationDelay = `${delay}s`;
      
      // Random shape
      const shapes = ['circle', 'square', 'triangle'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      element.classList.add(shape);
      
      container.appendChild(element);
      
      // Remove element after animation
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, (duration + delay) * 1000);
    };

    // Create elements periodically
    const interval = setInterval(createFloatingElement, 2000);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="interactive-effects" ref={containerRef}>
      {/* Mouse trail effect will be added here */}
    </div>
  );
};

export default InteractiveEffects;
