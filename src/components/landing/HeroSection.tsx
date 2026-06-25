'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';

// MAGNETIC WRAPPER FOR BUTTON HOVERS
function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 120, damping: 12, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Attract the button towards the cursor (up to 30px)
    x.set((e.clientX - centerX) * 0.32);
    y.set((e.clientY - centerY) * 0.32);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
}

export default function HeroSection() {
  const { scrollY } = useScroll();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Autoplay check completed. Background stream initialized.", err);
      });
    }
  }, []);

  // Scroll parallax mappings for immersive layout adjustments
  const contentY = useTransform(scrollY, [0, 600], [0, -120]);
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const bgScale = useTransform(scrollY, [0, 800], [1, 1.15]);
  const bgY = useTransform(scrollY, [0, 800], [0, 80]);
  const statsY = useTransform(scrollY, [0, 600], [0, -60]);
  const statsOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative h-screen min-h-[650px] flex flex-col justify-between items-center overflow-hidden px-4 sm:px-6 py-8 sm:py-10 md:py-12">
      {/* Full-bleed parallax background VIDEO */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ scale: bgScale, y: bgY }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/backgrounds/space-station.jpg"
          className="w-full h-full object-cover object-center pointer-events-none transform-gpu will-change-transform backface-hidden"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          <source src="/demo-video.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Dark cinematic overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030014]/85 via-[#030014]/50 to-[#030014]/90 z-[1] pointer-events-none" />

      {/* Radial vignette for depth */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(3,0,20,0.85) 100%)' }} />

      {/* Main Core HUD Overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none hud-grid opacity-15" />

      {/* Spacer to push content to center */}
      <div className="hidden md:block h-6" />

      {/* Content Container */}
      <motion.div 
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 text-center px-4 max-w-5xl mx-auto my-auto flex flex-col items-center justify-center flex-1"
      >
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-4 inline-block"
        >
          <span className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-full glass text-xs font-semibold text-purple-300 border border-purple-500/20 uppercase tracking-widest text-[10px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-glow shadow-[0_0_10px_#22d3ee]" />
            Project Zenith: The Celestial Eye
          </span>
        </motion.div>

        {/* Character Reveal Cinematic Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-4 sm:mb-6 leading-none select-none"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <div className="flex justify-center flex-wrap gap-x-2 sm:gap-x-3 md:gap-x-5">
            {"ZENITH".split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 35, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="gradient-text glow-text inline-block"
              >
                {char}
              </motion.span>
            ))}
          </div>
          <div className="flex justify-center flex-wrap gap-x-2 sm:gap-x-3 md:gap-x-5 mt-1 sm:mt-2">
            {"QUEST".split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 35, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.7,
                  delay: 0.55 + index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-white/95 inline-block"
              >
                {char}
              </motion.span>
            ))}
          </div>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto mb-6 sm:mb-8 font-light tracking-wide leading-relaxed px-4"
        >
          Discover what is happening above you tonight. Real-time satellite sweeps, AI narration, stargazing missions, and interactive celestial maps.
        </motion.p>

        {/* CTA Button - Wrapped in Spring Magnetism */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex items-center justify-center"
        >
          <MagneticButton>
            <Link href="/dashboard" className="btn-primary text-sm sm:text-base px-8 py-3.5 flex items-center gap-2.5 group">
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Bottom Container for Stats and Scroll Info */}
      <div className="w-full flex flex-col items-center gap-6 mt-6 relative z-10">
        {/* Stats bar */}
        <motion.div
          style={{ y: statsY, opacity: statsOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-16 px-6 select-none"
        >
          {[
            { value: '12K+', label: 'Celestial Objects' },
            { value: '24/7', label: 'Telemetry Sweeps' },
            { value: '100%', label: 'Sky Precision' },
            { value: 'AI-Narrator', label: 'Command Intel' },
          ].map((stat) => (
            <div key={stat.label} className="text-center group select-none cursor-default">
              <div className="text-lg sm:text-xl md:text-2xl font-extrabold gradient-text glow-text group-hover:scale-110 transition-transform duration-300 tracking-tight">
                {stat.value}
              </div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="flex flex-col items-center gap-1.5 pointer-events-none"
        >
          <span className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-semibold">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-slate-700 flex items-start justify-center pt-1.5 backdrop-blur-sm bg-[#030014]/30"
          >
            <div className="w-1 h-1 rounded-full bg-cyan-400" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
