'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import type { MoonPhase } from '@/lib/types/astronomy';

export default function MoonPhaseCard({ moonPhase }: { moonPhase: MoonPhase }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="relative overflow-hidden cursor-none h-full">
        {/* HUD borders */}
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />
        <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none" />

        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Luna Phase</h3>
          <p className="text-[10px] text-amber-400 uppercase tracking-widest font-mono font-semibold">Tidal Sweep</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
          {/* Glowing Moon Phase Sphere */}
          <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center bg-black/25 rounded-full border border-white/5 shadow-inner">
            <motion.div
              className="text-6xl select-none filter drop-shadow-[0_0_12px_rgba(245,158,11,0.25)] relative z-10"
              animate={{ 
                y: [0, -6, 0],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
            >
              {moonPhase.emoji}
            </motion.div>
            
            {/* Glowing atmosphere aura */}
            <div
              className="absolute inset-2 rounded-full blur-xl opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }}
            />
            {/* Outer dotted calibration line */}
            <div className="absolute inset-1 rounded-full border border-dashed border-amber-500/10 pointer-events-none" />
          </div>

          <div className="flex-1">
            <h4 className="text-lg font-bold text-white mb-1 tracking-wide">{moonPhase.phase}</h4>
            <div className="flex items-center gap-1.5 mb-3 text-xs font-mono text-slate-400">
              <span>Illumination:</span>
              <span className="text-amber-400 font-bold">{moonPhase.illumination}%</span>
            </div>

            {/* Illumination gradient slider */}
            <div className="w-full h-[3px] bg-slate-900 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-amber-400 to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${moonPhase.illumination}%` }}
                transition={{ duration: 1.2, delay: 0.4 }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>CYCLE: {moonPhase.age.toFixed(1)} / 29.5 DAYS</span>
              <span className="text-amber-500/80 font-bold uppercase">Sweep Active</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
