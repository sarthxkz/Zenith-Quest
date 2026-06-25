'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
}

export default function SpaceBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse position
    const mouse = { x: -1000, y: -1000, active: false };

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Generate particles
    const particlesCount = Math.min(100, Math.floor((width * height) / 15000));
    const particles: Particle[] = [];

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.08,
        vy: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.08,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: prefersReducedMotion ? 0 : 0.003 + Math.random() * 0.007,
      });
    }

    const draw = () => {
      // Clear canvas with transparency to allow the background video to show through
      ctx.clearRect(0, 0, width, height);

      // Draw faint, moving radial aurora gradient at the center
      const time = prefersReducedMotion ? 0 : Date.now() * 0.0003;
      const auroraX = width / 2 + Math.sin(time) * (width * 0.15);
      const auroraY = height * 0.4 + Math.cos(time * 0.8) * (height * 0.1);
      
      const auroraGrad = ctx.createRadialGradient(
        auroraX,
        auroraY,
        0,
        auroraX,
        auroraY,
        Math.max(width, height) * 0.7
      );
      auroraGrad.addColorStop(0, 'rgba(124, 58, 237, 0.035)'); // purple
      auroraGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.015)'); // cyan
      auroraGrad.addColorStop(1, 'rgba(5, 8, 22, 0)');
      
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Twinkle alpha
          p.alpha += p.twinkleSpeed;
          if (p.alpha > 1 || p.alpha < 0.2) {
            p.twinkleSpeed = -p.twinkleSpeed;
          }

          // Boundary bounce
          if (p.x < 0 || p.x > width) p.vx = -p.vx;
          if (p.y < 0 || p.y > height) p.vy = -p.vy;
        }

        // Draw star
        ctx.fillStyle = `rgba(167, 139, 250, ${p.alpha})`; // purple tint
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Reactive constellation lines to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.15;
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`; // cyan lines
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connection to active mouse pointer
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.25;
            ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            
            // Attract particle slightly towards mouse
            if (!prefersReducedMotion) {
              p.x -= dx * 0.008;
              p.y -= dy * 0.008;
            }
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />;
}
