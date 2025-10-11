import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const pointsRef = useRef([]);
  const targetRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    console.log('Initializing animated background', { width, height });

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Initialize points
    const points = [];
    const pointCount = Math.floor((width * height) / 8000); // Adjust density based on screen size

    for (let i = 0; i < pointCount; i++) {
      const point = {
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        active: 0,
        closest: [],
        color: Math.random() > 0.5 ? 'rgba(102, 126, 234' : 'rgba(255, 119, 198',
        pulse: Math.random() * Math.PI * 2
      };
      points.push(point);
    }

    // Find closest points for each point
    points.forEach((point, i) => {
      const closest = [];
      points.forEach((otherPoint, j) => {
        if (i !== j) {
          const distance = getDistance(point, otherPoint);
          if (closest.length < 5) {
            closest.push({ point: otherPoint, distance });
          } else {
            const maxDistance = Math.max(...closest.map(c => c.distance));
            if (distance < maxDistance) {
              const maxIndex = closest.findIndex(c => c.distance === maxDistance);
              closest[maxIndex] = { point: otherPoint, distance };
            }
          }
        }
      });
      point.closest = closest.map(c => c.point);
    });

    pointsRef.current = points;

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update points
      points.forEach(point => {
        // Move point with some randomness
        point.x += point.vx + (Math.random() - 0.5) * 0.1;
        point.y += point.vy + (Math.random() - 0.5) * 0.1;

        // Add pulsing effect
        point.pulse += 0.02;
        const pulseFactor = 1 + Math.sin(point.pulse) * 0.2;

        // Bounce off edges with some damping
        if (point.x < 0 || point.x > width) {
          point.vx *= -0.8;
          point.x = Math.max(0, Math.min(width, point.x));
        }
        if (point.y < 0 || point.y > height) {
          point.vy *= -0.8;
          point.y = Math.max(0, Math.min(height, point.y));
        }

        // Calculate distance to mouse
        const mouseDistance = getDistance(point, mouseRef.current);
        
        // Set active state based on distance to mouse
        if (mouseDistance < 200) {
          point.active = Math.max(0.4, 1 - mouseDistance / 200);
        } else if (mouseDistance < 400) {
          point.active = Math.max(0.1, 0.4 - (mouseDistance - 200) / 200 * 0.3);
        } else {
          point.active = 0.05;
        }

        // Draw connections to closest points
        if (point.active > 0.1) {
          point.closest.forEach(closestPoint => {
            const distance = getDistance(point, closestPoint);
            if (distance < 150) {
              const opacity = point.active * (1 - distance / 150) * 0.4;
              ctx.beginPath();
              ctx.moveTo(point.x, point.y);
              ctx.lineTo(closestPoint.x, closestPoint.y);
              ctx.strokeStyle = `${point.color}, ${opacity})`;
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          });
        }

        // Draw point with glow effect
        if (point.active > 0) {
          const currentRadius = point.radius * pulseFactor;
          const currentOpacity = point.active * point.opacity;
          
          // Outer glow
          ctx.beginPath();
          ctx.arc(point.x, point.y, currentRadius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `${point.color}, ${currentOpacity * 0.2})`;
          ctx.fill();
          
          // Inner point
          ctx.beginPath();
          ctx.arc(point.x, point.y, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = `${point.color}, ${currentOpacity})`;
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse move handler
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    // Resize handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    // Start animation
    console.log('Starting animation with', points.length, 'points');
    animate();

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getDistance = (p1, p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <div className="animated-background">
      <canvas
        ref={canvasRef}
        className="animated-canvas"
      />
    </div>
  );
};

export default AnimatedBackground;
