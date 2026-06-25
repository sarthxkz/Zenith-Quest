'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import type { CelestialBody } from '@/lib/types/astronomy';
import { PLANET_COLORS } from '@/lib/utils/constants';

export default function PlanetCard({ planets }: { planets: CelestialBody[] }) {
  const visiblePlanets = planets.filter((p) => p.isVisible);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Visible Planets</h3>
            <p className="text-[10px] text-purple-400 uppercase tracking-widest font-mono font-semibold">Orbits aligned</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono font-bold">
            {visiblePlanets.length} DETECTED
          </span>
        </div>

        <div className="space-y-2.5">
          {planets.map((planet, i) => (
            <motion.div
              key={planet.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-center justify-between p-2 rounded-lg border border-transparent transition-all duration-300 ${
                planet.isVisible 
                  ? 'bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/5' 
                  : 'opacity-30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Glowing Core Coordinate Point */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 relative"
                  style={{
                    backgroundColor: PLANET_COLORS[planet.name] || '#fff',
                    boxShadow: planet.isVisible
                      ? `0 0 10px ${PLANET_COLORS[planet.name] || '#fff'}`
                      : 'none',
                  }}
                >
                  {planet.isVisible && (
                    <span 
                      className="absolute inset-[-4px] rounded-full border border-dashed animate-spin-slow" 
                      style={{ borderColor: `${PLANET_COLORS[planet.name]}50` }}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-wide">{planet.name}</span>
                    {planet.isVisible && (
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
                        Azi Match
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase truncate">
                    {planet.isVisible
                      ? `${planet.altitude.toFixed(1)}° ALT · ${planet.constellation}`
                      : 'BELOW HORIZON'}
                  </p>
                </div>
              </div>

              {/* Magnitude Indicator */}
              <div className="text-right flex-shrink-0 font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Magnitude</span>
                <span className="text-xs font-bold text-slate-300 tabular-nums">
                  {planet.magnitude.toFixed(1)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}
