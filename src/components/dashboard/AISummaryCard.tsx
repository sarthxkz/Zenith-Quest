'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import GlassCard from '@/components/shared/GlassCard';

interface AISummaryCardProps {
  summary: string;
}

// DYNAMIC VOICE WAVE ANIMATION
function VoiceWave({ active }: { active: boolean }) {
  const bars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <div className="flex items-center gap-[3px] h-6 px-3 bg-black/35 rounded-full border border-white/5">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-gradient-to-t from-purple-500 to-cyan-400"
          animate={
            active
              ? {
                  height: [6, 20, 4, 14, 6],
                }
              : {
                  height: [4, 7, 4],
                }
          }
          transition={{
            duration: active ? 1.0 + (i % 3) * 0.2 : 1.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.06,
          }}
        />
      ))}
      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono ml-2 font-semibold select-none">
        {active ? 'SYNTHESIZING' : 'SECURE CONNECTED'}
      </span>
    </div>
  );
}

export default function AISummaryCard({ summary }: AISummaryCardProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!summary) return;
    let i = 0;
    setDisplayText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      if (i < summary.length) {
        setDisplayText(summary.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 15); // slightly faster typing speed for premium responsive text reveal

    return () => clearInterval(interval);
  }, [summary]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="relative overflow-hidden cursor-none">
        {/* Subtle grid background */}
        <div className="absolute inset-0 hud-grid opacity-15 pointer-events-none" />

        {/* HUD corner overlays */}
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />

        {/* Dynamic gradient atmosphere */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10 animate-gradient" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-base">🧠</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">AI Sky Narrator</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Zenith Tactical Intel</p>
              </div>
            </div>
            
            {/* Embedded voice wave frequency helper */}
            <VoiceWave active={isTyping} />
          </div>

          {/* Glowing Console Output Box */}
          <div className="p-5 rounded-xl bg-black/25 border border-white/[0.03] min-h-[100px] shadow-inner relative">
            <p className="text-sm text-slate-300 leading-relaxed font-light select-text">
              {displayText}
              {isTyping && (
                <motion.span 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-[3px] h-3.5 bg-cyan-400 ml-1.5 align-middle"
                />
              )}
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
