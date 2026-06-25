'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import { mockMissions } from '@/lib/mock/mockMissions';
import type { Mission } from '@/lib/types/mission';

const tabs = ['available', 'active', 'completed'] as const;

const difficultyColors = {
  beginner: 'text-green-400 bg-green-500/10 border-green-500/20',
  intermediate: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  advanced: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  expert: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

// FIREWORKS/BURST PARTICLES CONTAINER
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

function MissionCard({ 
  mission, 
  index, 
  onTriggerBurst 
}: { 
  mission: Mission; 
  index: number; 
  onTriggerBurst: (clientX: number, clientY: number) => void;
}) {
  const handleStartMission = (e: React.MouseEvent<HTMLButtonElement>) => {
    onTriggerBurst(e.clientX, e.clientY);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="group relative overflow-hidden cursor-none">
        <div className="hud-corner hud-corner-tl opacity-40" />
        <div className="hud-corner hud-corner-tr opacity-40" />
        <div className="hud-corner hud-corner-bl opacity-40" />
        <div className="hud-corner hud-corner-br opacity-40" />
        <div className="absolute inset-0 hud-grid opacity-5 pointer-events-none" />

        {/* Progress track background */}
        {mission.status === 'active' && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none transition-all"
            style={{ width: `${mission.progress}%` }}
          />
        )}

        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border border-purple-500/25 flex items-center justify-center text-2xl flex-shrink-0">
              {mission.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-bold text-white tracking-wide">{mission.title}</h3>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold uppercase ${difficultyColors[mission.difficulty]}`}>
                  {mission.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3.5 font-light leading-relaxed">{mission.description}</p>

              {/* Requirements tags */}
              <div className="flex flex-wrap gap-1.5 mb-4 font-mono">
                {mission.requirements.map((req, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-black/35 text-slate-500 border border-white/[0.02] uppercase font-semibold">
                    {req}
                  </span>
                ))}
              </div>

              {/* Progress Bar for Active */}
              {mission.status === 'active' && (
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-3 border border-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${mission.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold gradient-text-gold tracking-tight">+{mission.xpReward} XP</span>
                {mission.status === 'available' && (
                  <button 
                    onClick={handleStartMission} 
                    className="text-xs btn-primary px-4 py-1.5"
                  >
                    Start Mission
                  </button>
                )}
                {mission.status === 'active' && (
                  <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/20 border border-cyan-500/15 px-2 py-0.5 rounded">
                    {mission.progress}% complete
                  </span>
                )}
                {mission.status === 'completed' && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/15 px-2.5 py-0.5 rounded flex items-center gap-1 select-none">
                    ✓ Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function MissionsPage() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('available');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);

  const filteredMissions = mockMissions.filter((m) => m.status === activeTab);
  const totalXP = mockMissions.filter(m => m.status === 'completed').reduce((sum, m) => sum + m.xpReward, 0);

  // Spark burst simulation loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sparks = sparksRef.current;

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.15; // gravity pulls sparks down
        s.life -= 0.015;
        s.alpha = Math.max(0, s.life);

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = s.size * 3;
        ctx.shadowColor = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        if (s.life <= 0) {
          sparks.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(loop);
    };
    
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const triggerBurst = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const colors = ['#a78bfa', '#22d3ee', '#ec4899', '#f59e0b', '#10b981'];

    // Generate 40 explosive spark coordinates
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = 2 + Math.random() * 6;
      sparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // initial upward jump
        size: Math.random() * 2.5 + 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        life: 1.0 + Math.random() * 0.5,
      });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] select-none cursor-none relative">
      {/* Absolute particle canvas overlay */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-[100] w-full h-full" 
      />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-white mb-1.5 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Astronomy Mission Board
        </h1>
        <p className="text-sm text-slate-400 font-light font-mono uppercase tracking-widest">
          Acquire celestial coordinates, execute sweeps, climb ranks
        </p>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 font-mono">
        {[
          { label: 'Available', value: mockMissions.filter(m => m.status === 'available').length, icon: '🎯', color: 'text-purple-400' },
          { label: 'Active', value: mockMissions.filter(m => m.status === 'active').length, icon: '⚡', color: 'text-cyan-400' },
          { label: 'Completed', value: mockMissions.filter(m => m.status === 'completed').length, icon: '✅', color: 'text-emerald-400' },
          { label: 'XP Earned', value: totalXP, icon: '⭐', color: 'text-amber-400' },
        ].map((stat) => (
          <GlassCard key={stat.label} hover={false} className="text-center py-4 relative overflow-hidden">
            <div className="hud-corner hud-corner-tl opacity-50" />
            <div className="hud-corner hud-corner-tr opacity-50" />
            <div className="hud-corner hud-corner-bl opacity-50" />
            <div className="hud-corner hud-corner-br opacity-50" />
            <div className="absolute inset-0 hud-grid opacity-5 pointer-events-none" />

            <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">{stat.icon}</span>
            <div className={`text-2xl font-black mt-1 tracking-tight leading-none ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1.5 font-semibold">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 mb-8 font-mono">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl border transition-all duration-300 ${
              activeTab === tab
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/35 shadow-[0_0_15px_rgba(124,58,237,0.15)]'
                : 'bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mission cards grid */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredMissions.length > 0 ? (
            filteredMissions.map((mission, i) => (
              <MissionCard 
                key={mission.id} 
                mission={mission} 
                index={i} 
                onTriggerBurst={triggerBurst}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 glass-card-static relative"
            >
              <div className="hud-corner hud-corner-tl opacity-50" />
              <div className="hud-corner hud-corner-tr opacity-50" />
              <div className="hud-corner hud-corner-bl opacity-50" />
              <div className="hud-corner hud-corner-br opacity-50" />
              <div className="absolute inset-0 hud-grid opacity-10" />

              <div className="text-4xl mb-4 animate-float">🔭</div>
              <p className="text-slate-400 font-light font-mono uppercase tracking-widest text-xs">No {activeTab} missions on record</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
