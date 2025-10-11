import React, { useEffect, useRef, useCallback } from 'react';
import './CursorTrail.css';

const CursorTrail = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const createParticle = useCallback((x, y, vx = 0, vy = 0) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffecd2'];
    return {
      x,
      y,
      vx: vx + (Math.random() - 0.5) * 1.5,
      vy: vy + (Math.random() - 0.5) * 1.5,
      life: 1.0,
      decay: Math.random() * 0.025 + 0.015,
      size: Math.random() * 12 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      glow: Math.random() * 0.3 + 0.4,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      smoke: true,
      turbulence: Math.random() * 0.02 + 0.01
    };
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Clear canvas completely - no gray trail
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    const particles = particlesRef.current;
    
    // Remove very old particles to prevent accumulation
    if (particles.length > 200) {
      particles.splice(0, particles.length - 150);
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Update particle with smoke physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Add turbulence for smoke effect
      particle.vx += (Math.random() - 0.5) * particle.turbulence;
      particle.vy += (Math.random() - 0.5) * particle.turbulence;
      
      // Gentle friction for smoke
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Slight upward drift for smoke
      particle.vy -= 0.02;
      
      particle.life -= particle.decay;
      particle.angle += particle.rotationSpeed;
      
      // Draw smoke particle
      if (particle.life > 0) {
        ctx.save();
        // Make particles more transparent as they age
        const ageFactor = Math.pow(particle.life, 2);
        ctx.globalAlpha = ageFactor * particle.glow;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle);
        
        // Create smoke gradient with size based on age
        const currentSize = particle.size * ageFactor;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize);
        gradient.addColorStop(0, particle.color + 'FF');
        gradient.addColorStop(0.3, particle.color + 'CC');
        gradient.addColorStop(0.6, particle.color + '66');
        gradient.addColorStop(1, 'transparent');
        
        // Draw main smoke blob
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add additional puff layer for more volume
        if (ageFactor > 0.4) {
          const puffGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 0.7);
          puffGradient.addColorStop(0, particle.color + 'AA');
          puffGradient.addColorStop(0.5, particle.color + '44');
          puffGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = puffGradient;
          ctx.beginPath();
          ctx.arc(0, 0, currentSize * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Add smaller smoke wisps (only for younger particles)
        if (ageFactor > 0.2) {
          for (let j = 0; j < 5; j++) {
            const wispX = (Math.random() - 0.5) * currentSize * 0.8;
            const wispY = (Math.random() - 0.5) * currentSize * 0.8;
            const wispSize = currentSize * (0.3 + Math.random() * 0.4);
            
            const wispGradient = ctx.createRadialGradient(wispX, wispY, 0, wispX, wispY, wispSize);
            wispGradient.addColorStop(0, particle.color + '88');
            wispGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = wispGradient;
            ctx.beginPath();
            ctx.arc(wispX, wispY, wispSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        ctx.restore();
      } else {
        particles.splice(i, 1);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseRef.current = { x, y };

    // Create particles based on mouse movement speed
    const dx = x - lastMouseRef.current.x;
    const dy = y - lastMouseRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 2) {
      // Create smoke particles
      const particleCount = Math.min(Math.floor(distance / 3), 15);
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
        const speed = Math.random() * 2.5 + 0.3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        particlesRef.current.push(createParticle(x, y, vx, vy));
      }
    }
    
    // Add random particles even with slow movement for continuous puff
    if (Math.random() < 0.3) {
      const randomAngle = Math.random() * Math.PI * 2;
      const randomSpeed = Math.random() * 1.5 + 0.2;
      const vx = Math.cos(randomAngle) * randomSpeed;
      const vy = Math.sin(randomAngle) * randomSpeed;
      
      particlesRef.current.push(createParticle(x, y, vx, vy));
    }

    lastMouseRef.current = { x, y };
  }, [createParticle]);

  const handleMouseLeave = useCallback(() => {
    // Create burst of smoke when mouse leaves
    const particles = particlesRef.current;
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = Math.random() * 3 + 1;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      particles.push(createParticle(mouseRef.current.x, mouseRef.current.y, vx, vy));
    }
  }, [createParticle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    animate();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [animate, handleMouseMove, handleMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-trail"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        background: 'transparent'
      }}
    />
  );
};

export default CursorTrail;
