'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import GlassCard from '@/components/shared/GlassCard';

const features = [
  {
    icon: '🌟',
    title: 'Sky Score Engine',
    description: 'Real-time analysis of stargazing conditions with a 0-100 score based on cloud cover, light pollution, and celestial activity.',
    gradient: 'from-purple-500 to-blue-500',
  },
  {
    icon: '🛰️',
    title: 'Satellite Tracking',
    description: 'Track the ISS, Starlink trains, and thousands of satellites in real-time on an interactive map.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: '🤖',
    title: 'AI Sky Narrator',
    description: 'Get personalized natural language summaries of tonight\'s sky powered by AI intelligence.',
    gradient: 'from-pink-500 to-purple-500',
  },
  {
    icon: '🔭',
    title: '3D Sky Dome',
    description: 'Explore the night sky in an interactive 3D celestial sphere with stars, planets, and constellations.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: '🎯',
    title: 'Missions & XP',
    description: 'Complete astronomy missions, earn XP, unlock badges, and climb the explorer ranks.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: '⏱️',
    title: 'Celestial Timeline',
    description: 'See every celestial event tonight in chronological order — from sunset to sunrise.',
    gradient: 'from-green-500 to-emerald-500',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } 
  },
};

export default function FeatureShowcase() {
  const ref = useRef(null);

  return (
    <section ref={ref} className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Full background image — explorer gazing at cosmic sky */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/backgrounds/explorer-cliff.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030014]/85 via-[#030014]/70 to-[#030014]/90 z-[1]" />
      {/* Radial glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyan-900/5 blur-3xl pointer-events-none z-[1]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 sm:mb-20 lg:mb-24"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] text-purple-400 font-bold">Features</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 sm:mt-4 mb-4 sm:mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-white">Your Complete </span>
            <span className="gradient-text glow-text">Sky Toolkit</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Everything you need to explore, understand, and enjoy the night sky — all in one beautiful, high-fidelity platform.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group"
            >
              <GlassCard className="relative p-8 h-full flex flex-col justify-between cursor-none">
                {/* HUD Corners for that military intelligence overlay look */}
                <div className="hud-corner hud-corner-tl" />
                <div className="hud-corner hud-corner-tr" />
                <div className="hud-corner hud-corner-bl" />
                <div className="hud-corner hud-corner-br" />
                
                {/* HUD inner grid highlight */}
                <div className="absolute inset-0 hud-grid opacity-15 pointer-events-none z-0" />

                <div className="relative z-10">
                  {/* Icon with smooth float animation */}
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="text-4xl mb-6 inline-block filter drop-shadow-[0_0_8px_rgba(167,139,250,0.3)]"
                  >
                    {feature.icon}
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom interactive progress accent */}
                <div className="relative z-10 mt-8">
                  <div className={`h-[2px] w-12 rounded-full bg-gradient-to-r ${feature.gradient} group-hover:w-full transition-all duration-500 ease-out`} />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-14 sm:mt-20"
        >
          <p className="text-slate-500 text-sm mb-5 font-medium tracking-wide">Ready to explore the cosmos?</p>
          <a href="/dashboard" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5 group">
            Launch Dashboard
            <span className="text-lg group-hover:translate-x-1 transition-transform">🚀</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
