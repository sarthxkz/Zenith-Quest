'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Zenith Quest...');
  const [show, setShow] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 1. Text telemetry progression
    const intervals = [
      { t: 0, txt: 'INITIALIZING APERTURE CORES...' },
      { t: 300, txt: 'ESTABLISHING ORBITAL TELEMETRY...' },
      { t: 600, txt: 'FETCHING CURRENT STAR CORRELATIONS...' },
      { t: 900, txt: 'CALCULATING ATMOSPHERIC REFRACTION...' },
      { t: 1200, txt: 'SYNCHRONIZING CELESTIAL SPHERE...' },
      { t: 1400, txt: 'SYSTEM READY' },
    ];

    intervals.forEach(({ t, txt }) => {
      setTimeout(() => setLoadingText(txt), t);
    });

    // 2. Progress percentage
    const duration = 1500;
    const step = 20;
    const increment = 100 / (duration / step);
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setShow(false), 250); // Fade out shortly after reaching 100%
          return 100;
        }
        return next;
      });
    }, step);

    // 3. Canvas 2D Galaxy animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles creation
    interface Particle {
      x: number;
      y: number;
      r: number;
      angle: number;
      dist: number;
      speed: number;
      color: string;
      arm: number;
    }

    const particles: Particle[] = [];
    const numParticles = 350;
    const arms = 3;

    for (let i = 0; i < numParticles; i++) {
      const arm = i % arms;
      // Stagger angles based on spiral arms
      const angle = (arm * 2 * Math.PI) / arms + Math.random() * 0.7;
      const dist = Math.random() * (Math.min(width, height) * 0.3) + 15;
      particles.push({
        x: 0,
        y: 0,
        r: Math.random() * 1.6 + 0.4,
        angle,
        dist,
        speed: (0.003 + Math.random() * 0.007) * (1 - dist / (Math.min(width, height) * 0.3)),
        color: arm === 0 ? '#7c3aed' : arm === 1 ? '#06b6d4' : '#ec4899',
        arm,
      });
    }

    const drawGalaxy = () => {
      ctx.fillStyle = 'rgba(3, 0, 20, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw galactic core glow
      const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 70);
      coreGlow.addColorStop(0, 'rgba(124, 58, 237, 0.35)');
      coreGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.12)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
      ctx.fill();

      // Render stars
      for (const p of particles) {
        p.angle += p.speed;
        // Spiral coordinates formula
        const spiralX = centerX + Math.cos(p.angle + p.dist * 0.008) * p.dist;
        const spiralY = centerY + Math.sin(p.angle + p.dist * 0.008) * p.dist;

        ctx.beginPath();
        ctx.arc(spiralX, spiralY, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      animationId = requestAnimationFrame(drawGalaxy);
    };

    drawGalaxy();

    return () => {
      clearInterval(progressInterval);
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-[#030014] flex flex-col items-center justify-center pointer-events-auto"
        >
          {/* Astrometric data background art */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/backgrounds/astrometric-data.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[#030014]/60 z-[1]" />

          <canvas ref={canvasRef} className="absolute inset-0 z-[2] pointer-events-none" />

          {/* Core HUD Container */}
          <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
            {/* Pulsing ring graphic */}
            <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-purple-500/40"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border border-double border-cyan-500/30"
              />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/25">
                ZQ
              </div>
            </div>

            {/* Letter reveal title */}
            <h1 
              className="text-2xl font-bold uppercase tracking-[0.25em] text-white mb-2 flex justify-center"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {'PROJECT ZENITH'.split('').map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.4, ease: 'easeOut' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </h1>
            <p className="text-[10px] text-purple-400 uppercase tracking-widest mb-8 font-semibold">
              The Celestial Eye
            </p>

            {/* Progress Bar */}
            <div className="w-full h-[2px] bg-white/[0.04] rounded-full overflow-hidden mb-4 relative">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Telemetry log */}
            <div className="h-6 flex items-center justify-center">
              <span className="text-[10px] text-slate-500 font-mono tracking-widest select-none">
                {loadingText}
              </span>
            </div>

            <span className="text-xs text-slate-400 font-mono font-medium mt-1">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
