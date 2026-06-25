'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import type { WeatherData } from '@/lib/types/weather';

export default function WeatherCard({ weather }: { weather: WeatherData }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="relative overflow-hidden cursor-none h-full">
        {/* HUD Details */}
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />
        <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Atmosphere</h3>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-semibold">Sensor Grid 01</p>
          </div>
          <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] select-none">{weather.icon}</span>
        </div>

        <div className="flex items-baseline gap-2.5 mb-2.5">
          <span className="text-5xl font-black text-white tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            {weather.temperature}
            <span className="text-2xl text-slate-500 font-normal">°C</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            FEELS: <span className="text-slate-200">{weather.feelsLike}°</span>
          </span>
        </div>

        <p className="text-sm text-slate-300 mb-6 font-light leading-relaxed">
          {weather.description}
        </p>

        {/* HUD Metrics Checklist */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          {[
            { label: 'CLOUD COVER', val: `${weather.cloudCover}%`, icon: '☁️', pct: weather.cloudCover, col: 'from-cyan-500 to-blue-500' },
            { label: 'VISIBILITY', val: `${weather.visibility} km`, icon: '👁️', pct: Math.min(100, (weather.visibility / 24) * 100), col: 'from-purple-500 to-indigo-500' },
            { label: 'HUMIDITY', val: `${weather.humidity}%`, icon: '💧', pct: weather.humidity, col: 'from-pink-500 to-purple-500' },
            { label: 'WIND SPEED', val: `${weather.windSpeed} km/h`, icon: '💨', pct: Math.min(100, (weather.windSpeed / 50) * 100), col: 'from-amber-500 to-orange-500' }
          ].map((item) => (
            <div key={item.label} className="p-2.5 rounded-lg bg-black/20 border border-white/[0.02] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-slate-500 font-semibold">{item.label}</span>
                <span className="text-xs font-bold text-white">{item.val}</span>
              </div>
              {/* Slider meter */}
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 1.0, delay: 0.4 }}
                  className={`h-full bg-gradient-to-r ${item.col} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}
