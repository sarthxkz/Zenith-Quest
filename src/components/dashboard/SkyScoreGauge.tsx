'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

interface SkyScoreGaugeProps {
  score: number;
  rating: string;
  className?: string;
}

export default function SkyScoreGauge({ score, rating, className = '' }: SkyScoreGaugeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColorTheme = () => {
    if (score >= 80) return {
      stroke: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
      bgGrad: 'from-emerald-900/35 via-emerald-950/15 to-space-900',
      textColor: 'text-emerald-400'
    };
    if (score >= 60) return {
      stroke: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.4)',
      bgGrad: 'from-blue-900/35 via-blue-950/15 to-space-900',
      textColor: 'text-blue-400'
    };
    if (score >= 40) return {
      stroke: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.4)',
      bgGrad: 'from-amber-900/35 via-amber-950/15 to-space-900',
      textColor: 'text-amber-400'
    };
    return {
      stroke: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.4)',
      bgGrad: 'from-red-900/35 via-red-950/15 to-space-900',
      textColor: 'text-red-400'
    };
  };

  const theme = getColorTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center select-none ${className}`}
    >
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Core HUD rings background (Grid alignment lines) */}
        <div className="absolute inset-4 rounded-full border border-white/[0.02] hud-grid pointer-events-none" />

        {/* Counter-rotating Outer Energy Ring 1 (Dashed) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-purple-500/10 pointer-events-none"
        />

        {/* Counter-rotating Inner Energy Ring 2 (Double Dashed) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border border-double border-cyan-500/10 pointer-events-none"
        />

        {/* Glow pulsing aura behind orb */}
        <div 
          className="absolute inset-6 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: theme.stroke }}
        />

        {/* Radial Spherical Orb Backing */}
        <div className={`absolute inset-6 rounded-full bg-gradient-to-br ${theme.bgGrad} border border-white/5 shadow-2xl z-10 flex flex-col items-center justify-center overflow-hidden`}>
          {/* Internal orbital particles */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none animate-pulse-glow" />
          
          {/* Inner details reflection grid */}
          <div className="absolute inset-0 hud-grid opacity-10" />

          {/* Core HUD indicators */}
          <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mb-1">Aperture</span>

          {/* Actual score numbers */}
          <div className="text-5xl font-black text-white leading-none tracking-tight flex items-baseline filter drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]" style={{ fontFamily: 'var(--font-display)' }}>
            <AnimatedCounter value={score} duration={1400} />
            <span className="text-xs text-slate-500 font-normal ml-0.5">%</span>
          </div>

          {/* Rating badge */}
          <div className={`text-xs font-bold uppercase tracking-wider mt-2.5 px-3 py-1 rounded-full bg-black/45 border border-white/5 ${theme.textColor} filter drop-shadow-[0_0_6px_rgba(255,255,255,0.03)]`}>
            {rating}
          </div>
        </div>

        {/* Core Circular Arc Score SVG */}
        <svg width="224" height="224" viewBox="0 0 200 200" className="absolute inset-0 transform -rotate-90 z-20 pointer-events-none">
          {/* Semi-transparent track ring */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="7"
          />
          {/* Main glowing progress track */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={theme.stroke}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? strokeDashoffset : circumference}
            className="score-ring"
            style={{
              filter: `drop-shadow(0 0 8px ${theme.glow})`,
            }}
          />
        </svg>
      </div>

      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em] mt-5">Sky Score Sweeps</p>
    </motion.div>
  );
}
