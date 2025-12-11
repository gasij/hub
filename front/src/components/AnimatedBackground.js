import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";
import './AnimatedBackground.css';

class Branch {
  constructor(
    width,
    height,
    noise,
    baseHue = 240,
    saturation = 70,
    opacity = 0.25,
    randomFactor = 0.2
  ) {
    // Start from bottom center (exactly like original)
    this.x = width / 2;
    this.y = height;
    // Pure blue color (no variation)
    this.hue = baseHue;
    this.saturation = saturation;
    this.opacity = opacity;
    this.vertices = [{ x: this.x, y: this.y }];
    this.direction = {
      x: (Math.random() - 0.5) * 4, // random(-2, 2)
      y: -(0.2 + Math.random() * 4.8), // random(-0.2, -5)
    };
    this.noise = noise;
    this.randomFactor = randomFactor;
    this.moving = true;
  }

  draw(ctx, strokeWeight) {
    if (this.vertices.length < 2) return;

    // Convert HSB to RGB for canvas - ensure pure blue color
    const h = this.hue % 360;
    const s = this.saturation / 100;
    const b = 0.8; // Reduced brightness for more saturated blue
    const a = this.opacity;

    // For pure blue (hue 240), use direct RGB values
    if (h >= 240 && h < 300) {
      // Pure blue range - use direct RGB
      const blueValue = Math.round(255 * b * s + 255 * (1 - s) * 0.2);
      const redValue = Math.round(255 * (1 - s) * 0.1);
      const greenValue = Math.round(255 * (1 - s) * 0.3);
      
      ctx.strokeStyle = `rgba(${redValue}, ${greenValue}, ${blueValue}, ${a})`;
    } else {
      // Fallback to HSB conversion for other hues
      const c = b * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = b - c;

      let r = 0, g = 0, blue = 0;

      if (h < 60) {
        r = c; g = x; blue = 0;
      } else if (h < 120) {
        r = x; g = c; blue = 0;
      } else if (h < 180) {
        r = 0; g = c; blue = x;
      } else if (h < 240) {
        r = 0; g = x; blue = c;
      } else if (h < 300) {
        r = x; g = 0; blue = c;
      } else {
        r = c; g = 0; blue = x;
      }

      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      blue = Math.round((blue + m) * 255);

      ctx.strokeStyle = `rgba(${r}, ${g}, ${blue}, ${a})`;
    }
    ctx.lineWidth = strokeWeight;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    ctx.stroke();
  }

  update(width, height, millis, ctx, strokeWeight) {
    if (this.moving) {
      if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
        this.moving = false;
      } else {
        this.move(millis);
      }
    }
    this.draw(ctx, strokeWeight);
  }

  move(millis) {
    // Exact match to original: p.simplex3(x, y, millis * 0.0001)
    this.direction.x += this.noise(
      this.x * 0.04 * this.randomFactor,
      this.y * 0.04 * this.randomFactor,
      millis * 0.0001
    );
    this.direction.y -= Math.abs(this.noise(
      this.y * 0.01,
      this.x * 0.01,
      millis * 0.0001
    )) * 0.2;

    this.x += this.direction.x;
    this.y += this.direction.y;

    this.vertices.push({ x: this.x, y: this.y });
  }
}

export const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Parameters (matching the original code but with blue colors)
    const baseHue = 240; // Pure blue
    const saturation = 80; // Higher saturation for vibrant blue
    const opacity = 0.15; // Reduced opacity for dimmer effect
    const strokeWeight = 1;
    const amount = 300;
    const randomFactor = 0.2;

    // Initialize branches
    const branches = [];
    let startTime = Date.now();
    // Create noise with custom random function to ensure it works
    let noise3D = createNoise3D(() => Math.random());

    const createBranches = () => {
      branches.length = 0;
      // Create new noise with random seed (like p.seed(Math.random()))
      // In simplex-noise v4, we can pass a random function
      noise3D = createNoise3D(() => Math.random());
      const noise = (x, y, z) => {
        return noise3D(x, y, z);
      };

      for (let i = 0; i < amount; i++) {
        branches.push(
          new Branch(
            canvas.width,
            canvas.height,
            noise,
            baseHue,
            saturation,
            opacity,
            randomFactor
          )
        );
      }
    };

    createBranches();

    let animationId;

    const animate = () => {
      if (!ctx) return;

      const millis = Date.now() - startTime; // millis() equivalent
      const noise = (x, y, z) => {
        return noise3D(x, y, z);
      };

      // Fade effect (like stroke(0, 0, 0, 20) in p5.js - black with low opacity for fade)
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)"; // 20/255 ≈ 0.08
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set blend mode to screen (additive blending)
      ctx.globalCompositeOperation = "screen";

      // Update and draw branches (like original: branch.update() which calls draw internally)
      branches.forEach((branch) => {
        branch.noise = noise;
        branch.update(canvas.width, canvas.height, millis, ctx, strokeWeight);
      });

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";

      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createBranches();
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

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