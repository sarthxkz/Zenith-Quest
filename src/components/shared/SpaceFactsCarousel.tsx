'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import { SPACE_FACTS } from '@/lib/utils/constants';

export default function SpaceFactsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SPACE_FACTS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fact = SPACE_FACTS[currentIndex];

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Space Fact</h3>
        <span className="text-xs text-slate-600">{currentIndex + 1} / {SPACE_FACTS.length}</span>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm text-slate-300 leading-relaxed">{fact.fact}</p>
        <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
          {fact.category}
        </span>
      </motion.div>

      {/* Progress bar */}
      <div className="mt-4 flex gap-1">
        {SPACE_FACTS.slice(0, 8).map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full bg-white/5 overflow-hidden">
            {i === currentIndex % 8 && (
              <motion.div
                className="h-full bg-purple-500/50 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 8, ease: 'linear' }}
              />
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
