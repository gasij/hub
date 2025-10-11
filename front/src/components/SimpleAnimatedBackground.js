import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

const SimpleAnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      // Just clear the canvas - no background particles
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      animationId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="animated-background">
      <canvas
        ref={canvasRef}
        className="animated-canvas"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default SimpleAnimatedBackground;
