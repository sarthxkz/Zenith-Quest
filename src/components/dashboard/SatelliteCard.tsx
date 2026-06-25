'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import type { SatellitePass } from '@/lib/types/satellite';
import { formatTime } from '@/lib/utils/formatters';

export default function SatelliteCard({ passes }: { passes: SatellitePass[] }) {
  const issPasses = passes.filter((p) => p.satellite.includes('ISS'));
  const starlinkPasses = passes.filter((p) => p.satellite.includes('STARLINK'));
  const nextPass = passes[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="relative overflow-hidden cursor-none h-full">
        {/* HUD Details */}
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />
        <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Orbit Sweeps</h3>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-semibold">Active telemetry</p>
          </div>
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">🛰️</span>
        </div>

        {/* Counter Panels */}
        <div className="grid grid-cols-2 gap-4 mb-5 font-mono">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/15">
            <div className="text-[9px] text-slate-500 uppercase font-semibold">ISS PASSES</div>
            <div className="text-2xl font-black text-white mt-1 leading-none tracking-tight">{issPasses.length}</div>
            <div className="text-[9px] text-blue-400 mt-2 font-bold uppercase">
              {issPasses.length > 0 ? 'Tonight Overhead' : 'No Sweep'}
            </div>
          </div>
          
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/15">
            <div className="text-[9px] text-slate-500 uppercase font-semibold">STARLINK</div>
            <div className="text-2xl font-black text-white mt-1 leading-none tracking-tight">{starlinkPasses.length}</div>
            <div className="text-[9px] text-purple-400 mt-2 font-bold uppercase">
              {starlinkPasses.length > 0 ? 'Sweeps Available' : 'No sweeps'}
            </div>
          </div>
        </div>

        {/* Next Sweep HUD detail */}
        {nextPass && (
          <div className="p-3.5 rounded-xl bg-black/25 border border-white/[0.03] font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Next Approaching Sweep</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 uppercase tracking-wide">
                {nextPass.satellite}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white tracking-wide">{formatTime(nextPass.startTime)}</span>
              <span className="text-xs text-slate-400">
                MAX EL: <span className="text-white font-bold">{nextPass.maxElevation}°</span>
              </span>
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
