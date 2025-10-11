import React, { useEffect, useRef, useCallback } from 'react';
import './LogoBackground.css';

const LogoBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const sparkleRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    progress: 0,
    isDrawing: true,
    currentLetter: 0,
    letterProgress: 0
  });

  // Define calligraphy path for "ithub" - MASSIVE SIZE
  const calligraphyPath = [
    // Letter 'i' - dot first, then line
    { x: -360, y: -135, type: 'move' },
    { x: -330, y: -135, type: 'line' },
    { x: -300, y: -135, type: 'line' },
    { x: -270, y: -135, type: 'line' },
    { x: -240, y: -135, type: 'line' },
    { x: -210, y: -135, type: 'line' },
    
    // Main line of 'i'
    { x: -315, y: -112, type: 'move' },
    { x: -315, y: -90, type: 'line' },
    { x: -315, y: -67, type: 'line' },
    { x: -315, y: -45, type: 'line' },
    { x: -315, y: -22, type: 'line' },
    { x: -315, y: 0, type: 'line' },
    { x: -315, y: 22, type: 'line' },
    { x: -315, y: 45, type: 'line' },
    { x: -315, y: 67, type: 'line' },
    { x: -315, y: 90, type: 'line' },
    { x: -315, y: 112, type: 'line' },
    { x: -315, y: 135, type: 'line' },
    { x: -315, y: 157, type: 'line' },
    
    // Letter 't' - cross first, then line
    { x: -255, y: -112, type: 'move' },
    { x: -225, y: -112, type: 'line' },
    { x: -195, y: -112, type: 'line' },
    { x: -165, y: -112, type: 'line' },
    { x: -135, y: -112, type: 'line' },
    { x: -105, y: -112, type: 'line' },
    { x: -75, y: -112, type: 'line' },
    { x: -45, y: -112, type: 'line' },
    
    // Main line of 't'
    { x: -195, y: -90, type: 'move' },
    { x: -195, y: -67, type: 'line' },
    { x: -195, y: -45, type: 'line' },
    { x: -195, y: -22, type: 'line' },
    { x: -195, y: 0, type: 'line' },
    { x: -195, y: 22, type: 'line' },
    { x: -195, y: 45, type: 'line' },
    { x: -195, y: 67, type: 'line' },
    { x: -195, y: 90, type: 'line' },
    { x: -195, y: 112, type: 'line' },
    { x: -195, y: 135, type: 'line' },
    { x: -195, y: 157, type: 'line' },
    
    // Letter 'h' - left line
    { x: -150, y: -90, type: 'move' },
    { x: -150, y: -67, type: 'line' },
    { x: -150, y: -45, type: 'line' },
    { x: -150, y: -22, type: 'line' },
    { x: -150, y: 0, type: 'line' },
    { x: -150, y: 22, type: 'line' },
    { x: -150, y: 45, type: 'line' },
    { x: -150, y: 67, type: 'line' },
    { x: -150, y: 90, type: 'line' },
    { x: -150, y: 112, type: 'line' },
    { x: -150, y: 135, type: 'line' },
    { x: -150, y: 157, type: 'line' },
    
    // Right part of 'h'
    { x: -150, y: -45, type: 'move' },
    { x: -120, y: -45, type: 'line' },
    { x: -90, y: -45, type: 'line' },
    { x: -60, y: -45, type: 'line' },
    { x: -30, y: -45, type: 'line' },
    { x: 0, y: -45, type: 'line' },
    { x: 0, y: -22, type: 'line' },
    { x: 0, y: 0, type: 'line' },
    { x: 0, y: 22, type: 'line' },
    { x: 0, y: 45, type: 'line' },
    { x: 0, y: 67, type: 'line' },
    { x: 0, y: 90, type: 'line' },
    { x: 0, y: 112, type: 'line' },
    { x: 0, y: 135, type: 'line' },
    { x: 0, y: 157, type: 'line' },
    
    // Letter 'u' - left curve
    { x: 45, y: -45, type: 'move' },
    { x: 45, y: -22, type: 'line' },
    { x: 45, y: 0, type: 'line' },
    { x: 45, y: 22, type: 'line' },
    { x: 45, y: 45, type: 'line' },
    { x: 45, y: 67, type: 'line' },
    { x: 45, y: 90, type: 'line' },
    { x: 45, y: 112, type: 'line' },
    { x: 45, y: 135, type: 'line' },
    { x: 45, y: 157, type: 'line' },
    
    // Bottom curve of 'u'
    { x: 45, y: 157, type: 'move' },
    { x: 75, y: 157, type: 'line' },
    { x: 105, y: 157, type: 'line' },
    { x: 135, y: 157, type: 'line' },
    { x: 165, y: 157, type: 'line' },
    { x: 195, y: 157, type: 'line' },
    { x: 225, y: 157, type: 'line' },
    
    // Right line of 'u'
    { x: 225, y: 157, type: 'move' },
    { x: 225, y: 135, type: 'line' },
    { x: 225, y: 112, type: 'line' },
    { x: 225, y: 90, type: 'line' },
    { x: 225, y: 67, type: 'line' },
    { x: 225, y: 45, type: 'line' },
    { x: 225, y: 22, type: 'line' },
    { x: 225, y: 0, type: 'line' },
    { x: 225, y: -22, type: 'line' },
    { x: 225, y: -45, type: 'line' },
    
    // Letter 'b' - main line
    { x: 270, y: -90, type: 'move' },
    { x: 270, y: -67, type: 'line' },
    { x: 270, y: -45, type: 'line' },
    { x: 270, y: -22, type: 'line' },
    { x: 270, y: 0, type: 'line' },
    { x: 270, y: 22, type: 'line' },
    { x: 270, y: 45, type: 'line' },
    { x: 270, y: 67, type: 'line' },
    { x: 270, y: 90, type: 'line' },
    { x: 270, y: 112, type: 'line' },
    { x: 270, y: 135, type: 'line' },
    { x: 270, y: 157, type: 'line' },
    
    // Upper loop of 'b'
    { x: 270, y: -45, type: 'move' },
    { x: 300, y: -45, type: 'line' },
    { x: 330, y: -45, type: 'line' },
    { x: 360, y: -45, type: 'line' },
    { x: 390, y: -45, type: 'line' },
    { x: 420, y: -45, type: 'line' },
    { x: 420, y: -22, type: 'line' },
    { x: 420, y: 0, type: 'line' },
    { x: 390, y: 0, type: 'line' },
    { x: 360, y: 0, type: 'line' },
    { x: 330, y: 0, type: 'line' },
    { x: 300, y: 0, type: 'line' },
    { x: 270, y: 0, type: 'line' },
    
    // Lower loop of 'b'
    { x: 270, y: 22, type: 'move' },
    { x: 300, y: 22, type: 'line' },
    { x: 330, y: 22, type: 'line' },
    { x: 360, y: 22, type: 'line' },
    { x: 390, y: 22, type: 'line' },
    { x: 420, y: 22, type: 'line' },
    { x: 420, y: 45, type: 'line' },
    { x: 420, y: 67, type: 'line' },
    { x: 420, y: 90, type: 'line' },
    { x: 390, y: 90, type: 'line' },
    { x: 360, y: 90, type: 'line' },
    { x: 330, y: 90, type: 'line' },
    { x: 300, y: 90, type: 'line' },
    { x: 270, y: 90, type: 'line' }
  ];

  const drawCalligraphy = useCallback((ctx, centerX, centerY, progress) => {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Set calligraphy style - EXTRA LARGE
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#667eea';
    ctx.shadowBlur = 40;
    
    const totalPoints = calligraphyPath.length;
    const pointsToDraw = Math.floor(totalPoints * progress);
    
    ctx.beginPath();
    for (let i = 0; i < pointsToDraw; i++) {
      const point = calligraphyPath[i];
      if (point.type === 'move') {
        if (i > 0) ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();
    
    ctx.restore();
  }, [calligraphyPath]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const sparkle = sparkleRef.current;
    const centerX = width / 2;
    const centerY = height / 2;

    // Update sparkle animation
    if (sparkle.isDrawing) {
      sparkle.progress += 0.008; // Drawing speed
      if (sparkle.progress >= 1) {
        sparkle.progress = 1;
        // Wait a bit before erasing
        setTimeout(() => {
          sparkle.isDrawing = false;
        }, 2000);
      }
    } else {
      sparkle.progress -= 0.01; // Erasing speed
      if (sparkle.progress <= 0) {
        sparkle.progress = 0;
        sparkle.isDrawing = true;
      }
    }

    // Draw calligraphy
    drawCalligraphy(ctx, centerX, centerY, sparkle.progress);

    // Draw sparkle at current position
    const currentPoint = calligraphyPath[Math.floor(calligraphyPath.length * sparkle.progress)];
    if (currentPoint) {
      ctx.save();
      ctx.translate(centerX + currentPoint.x, centerY + currentPoint.y);
      
      // Draw sparkle - EXTRA LARGE
      ctx.fillStyle = '#f093fb';
      ctx.shadowColor = '#f093fb';
      ctx.shadowBlur = 50;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      
      // Add cross - EXTRA LARGE
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(24, 0);
      ctx.moveTo(0, -24);
      ctx.lineTo(0, 24);
      ctx.stroke();
      
      ctx.restore();
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [drawCalligraphy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="logo-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -2,
        background: 'transparent'
      }}
    />
  );
};

export default LogoBackground;
