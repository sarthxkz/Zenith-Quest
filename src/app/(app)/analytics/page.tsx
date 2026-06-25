'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import { useLocationStore } from '@/lib/store/locationStore';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// Mock analytics data
const skyScoreHistory = [
  { date: 'Mon', score: 72 }, { date: 'Tue', score: 85 },
  { date: 'Wed', score: 45 }, { date: 'Thu', score: 68 },
  { date: 'Fri', score: 92 }, { date: 'Sat', score: 78 },
  { date: 'Sun', score: 81 },
];

const observationStats = [
  { month: 'Oct', observations: 12 }, { month: 'Nov', observations: 18 },
  { month: 'Dec', observations: 8 }, { month: 'Jan', observations: 22 },
  { month: 'Feb', observations: 15 }, { month: 'Mar', observations: 25 },
];

const missionCompletion = [
  { name: 'Observation', value: 12, color: '#7c3aed' },
  { name: 'Tracking', value: 8, color: '#06b6d4' },
  { name: 'Identification', value: 6, color: '#22c55e' },
  { name: 'Photography', value: 3, color: '#f59e0b' },
  { name: 'Exploration', value: 5, color: '#ec4899' },
];

const planetObservations = [
  { planet: 'Jupiter', count: 15 }, { planet: 'Saturn', count: 12 },
  { planet: 'Mars', count: 9 }, { planet: 'Venus', count: 7 },
  { planet: 'Mercury', count: 3 },
];

const satelliteStats = [
  { month: 'Oct', iss: 8, starlink: 12, other: 5 },
  { month: 'Nov', iss: 12, starlink: 15, other: 8 },
  { month: 'Dec', iss: 6, starlink: 10, other: 4 },
  { month: 'Jan', iss: 14, starlink: 20, other: 10 },
  { month: 'Feb', iss: 10, starlink: 18, other: 7 },
  { month: 'Mar', iss: 16, starlink: 22, other: 12 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card-static px-4 py-3 text-xs font-mono border border-purple-500/35 shadow-2xl relative bg-space-900/90 backdrop-blur-md">
      <div className="hud-corner hud-corner-tl opacity-50" />
      <div className="hud-corner hud-corner-tr opacity-50" />
      <div className="hud-corner hud-corner-bl opacity-50" />
      <div className="hud-corner hud-corner-br opacity-50" />
      
      <p className="text-white font-bold mb-2 border-b border-white/5 pb-1 select-none">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="capitalize font-semibold">
          🔹 {p.name}: <span className="text-white font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { currentLocation } = useLocationStore();

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] select-none cursor-none">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-white mb-1.5 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Analytics Deck
        </h1>
        <p className="text-sm text-slate-400 font-light font-mono uppercase tracking-widest">
          Tonight&apos;s statistical observation readouts for{' '}
          <span className="text-purple-400 font-extrabold">
            {currentLocation?.city || 'Detecting Location...'}
          </span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sky Score Trend (Area Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
          <GlassCard className="relative overflow-hidden">
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-tr" />
            <div className="hud-corner hud-corner-bl" />
            <div className="hud-corner hud-corner-br" />
            <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none" />

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Sky Score Trend</h3>
            
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={skyScoreHistory}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.15)" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#7c3aed" 
                  fill="url(#scoreGradient)" 
                  strokeWidth={2}
                  dot={{ stroke: '#7c3aed', strokeWidth: 2, r: 4, fill: '#030014' }}
                  activeDot={{ stroke: '#c4b5fd', strokeWidth: 2, r: 6, fill: '#7c3aed' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Observation Stats (Bar Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          <GlassCard className="relative overflow-hidden">
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-tr" />
            <div className="hud-corner hud-corner-bl" />
            <div className="hud-corner hud-corner-br" />
            <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none" />

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Observations per Month</h3>
            
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={observationStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.15)" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="observations" 
                  fill="#06b6d4" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                  className="transition-all duration-300"
                />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Mission Completion Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>
          <GlassCard className="relative overflow-hidden">
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-tr" />
            <div className="hud-corner hud-corner-bl" />
            <div className="hud-corner hud-corner-br" />
            <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none" />

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Mission Profiles</h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width={190} height={190}>
                <PieChart>
                  <Pie
                    data={missionCompletion}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {missionCompletion.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2.5 font-mono text-xs w-full sm:w-auto">
                {missionCompletion.map((item) => (
                  <div key={item.name} className="flex items-center gap-3 p-1.5 rounded bg-black/10 border border-white/[0.01]">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-400 font-medium">{item.name}</span>
                    <span className="text-white font-bold ml-auto tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Satellite Stacked Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          <GlassCard className="relative overflow-hidden">
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-tr" />
            <div className="hud-corner hud-corner-bl" />
            <div className="hud-corner hud-corner-br" />
            <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none" />

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Satellite Tracking Sweeps</h3>
            
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={satelliteStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.15)" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="iss" fill="#7c3aed" stackId="a" name="ISS" maxBarSize={28} />
                <Bar dataKey="starlink" fill="#06b6d4" stackId="a" name="Starlink" maxBarSize={28} />
                <Bar dataKey="other" fill="#22c55e" stackId="a" radius={[4, 4, 0, 0]} name="Other" maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Planet Observation ledger (concentric circles) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.35, ease: [0.16, 1, 0.3, 1] }} 
          className="lg:col-span-2"
        >
          <GlassCard className="relative overflow-hidden">
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-tr" />
            <div className="hud-corner hud-corner-bl" />
            <div className="hud-corner hud-corner-br" />
            <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none" />

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Concentric Orbit Observations</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {planetObservations.map((p, i) => {
                const colors = ['#c88b3a', '#ead6b8', '#c1440e', '#e8cda0', '#b5b5b5'];
                const color = colors[i] || '#7c3aed';
                return (
                  <div key={p.planet} className="text-center flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <circle cx="50" cy="50" r="41" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                        <motion.circle
                          cx="50" cy="50" r="41" fill="none"
                          stroke={color}
                          strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 41}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 41 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 41 * (1 - p.count / 20) }}
                          transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                          style={{
                            filter: `drop-shadow(0 0 4px ${color}35)`,
                          }}
                        />
                      </svg>
                      {/* Dotted border indicator inside circle */}
                      <div className="absolute inset-[10px] rounded-full border border-dashed border-white/[0.04]" />
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white font-mono tabular-nums">
                        {p.count}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 tracking-wide">{p.planet}</p>
                    <span className="text-[9px] text-slate-600 font-mono mt-0.5">SWEPT</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
