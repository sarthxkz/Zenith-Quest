'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import { mockPlanets, mockMoonPhase, mockSunData } from '@/lib/mock/mockAstronomy';
import { mockSatellitePasses } from '@/lib/mock/mockSatellites';
import { generateTimeline } from '@/lib/services/timelineGenerator';
import { formatTime } from '@/lib/utils/formatters';
import { useLocationStore } from '@/lib/store/locationStore';

export default function TimelinePage() {
  const { currentLocation } = useLocationStore();
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentLocation) return;

    const fetchTimelineData = async () => {
      setLoading(true);
      try {
        const lat = currentLocation.latitude;
        const lng = currentLocation.longitude;

        const [astroRes, satRes] = await Promise.all([
          fetch(`/api/astronomy?lat=${lat}&lng=${lng}`),
          fetch(`/api/satellites?lat=${lat}&lng=${lng}`),
        ]);

        if (astroRes.ok && satRes.ok) {
          const astroData = await astroRes.json();
          const satData = await satRes.json();

          const events = generateTimeline(
            astroData.sunData || mockSunData,
            astroData.moonPhase || mockMoonPhase,
            astroData.planets || mockPlanets,
            satData.issPasses || satData.passes || mockSatellitePasses
          );
          setTimelineEvents(events);
        }
      } catch (err) {
        console.error('Failed to generate live timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [currentLocation]);

  const displayEvents = timelineEvents.length > 0 ? timelineEvents : generateTimeline(mockSunData, mockMoonPhase, mockPlanets, mockSatellitePasses);

  const importanceThemes = {
    high: {
      border: 'border-purple-500/35 bg-purple-950/20 text-purple-300',
      lineGlow: 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_12px_rgba(167,139,250,0.5)]',
      dotGlow: 'shadow-[0_0_15px_#7c3aed]'
    },
    medium: {
      border: 'border-cyan-500/25 bg-cyan-950/15 text-cyan-300',
      lineGlow: 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.3)]',
      dotGlow: 'shadow-[0_0_10px_#06b6d4]'
    },
    low: {
      border: 'border-slate-800 bg-slate-900/40 text-slate-400',
      lineGlow: 'bg-slate-800',
      dotGlow: ''
    },
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto select-none cursor-none">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12"
      >
        <h1 className="text-3xl font-extrabold text-white mb-1.5 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Celestial Event Rail
        </h1>
        <p className="text-sm text-slate-400 font-light font-mono uppercase tracking-widest">
          Chronological sweep: sunset to sunrise
        </p>
      </motion.div>

      {/* Vertical Rail Container */}
      <div className="relative pl-2 sm:pl-8">
        
        {/* Futuristic Glowing vertical rail line */}
        <div className="absolute left-[30px] sm:left-[36px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-purple-500 via-cyan-400 to-purple-500/10 pointer-events-none z-0" />

        <div className="space-y-6 relative z-10">
          {displayEvents.map((event, i) => {
            const theme = importanceThemes[event.importance];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-4 sm:gap-6 group"
              >
                {/* Node Rail Connector */}
                <div className="flex-shrink-0 relative">
                  <motion.div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl border ${theme.border} ${theme.dotGlow} transition-all duration-300 group-hover:scale-110 z-10 relative bg-space-900/90 backdrop-blur-md`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {event.icon}
                  </motion.div>
                  
                  {/* High importance glow backing */}
                  {event.importance === 'high' && (
                    <div className="absolute inset-0 rounded-xl bg-purple-500/15 blur-lg -z-10 animate-pulse-glow" />
                  )}
                  {event.importance === 'medium' && (
                    <div className="absolute inset-0 rounded-xl bg-cyan-500/10 blur-md -z-10" />
                  )}
                </div>

                {/* Event details card overlay */}
                <GlassCard className="flex-1 p-5 relative overflow-hidden group-hover:border-purple-500/30 transition-all duration-300">
                  <div className="hud-corner hud-corner-tl opacity-50" />
                  <div className="hud-corner hud-corner-tr opacity-50" />
                  <div className="hud-corner hud-corner-bl opacity-50" />
                  <div className="hud-corner hud-corner-br opacity-50" />
                  <div className="absolute inset-0 hud-grid opacity-5 pointer-events-none" />

                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-2">
                    <h3 className="text-sm font-bold text-white tracking-wide group-hover:text-purple-300 transition-colors duration-300">
                      {event.title}
                    </h3>
                    <span className="text-xs text-cyan-400 font-mono font-bold tracking-widest bg-cyan-950/20 border border-cyan-500/10 px-2 py-0.5 rounded">
                      {formatTime(event.time)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 font-light">
                    {event.description}
                  </p>

                  {/* Fact Details HUD Tags */}
                  {event.details && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.03] font-mono">
                      {Object.entries(event.details).map(([key, val]) => (
                        <span key={key} className="text-[9px] px-2.5 py-1 rounded bg-black/30 text-slate-500 uppercase font-semibold border border-white/[0.02] flex items-center gap-1">
                          {key}: <span className="text-slate-300 font-bold">{val}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
