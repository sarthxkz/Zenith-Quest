'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const Sidebar = dynamic(() => import('@/components/shared/Sidebar'), { ssr: false });
const SpaceBackgroundCanvas = dynamic(() => import('@/components/shared/SpaceBackgroundCanvas'), { ssr: false });
const Navbar = dynamic(() => import('@/components/shared/Navbar'), { ssr: false });
const AIAssistantWidget = dynamic(() => import('@/components/dashboard/AIAssistantWidget'), { ssr: false });

import { useRef } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check, { passive: true });
    
    // Play background video programmatically to bypass browser blocks
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Dashboard background video stream check completed.", err);
      });
    }
    
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="min-h-screen relative text-slate-100 selection:bg-violet-500/30">
      {/* Immersive background video layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050816]">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center transform-gpu will-change-transform backface-hidden opacity-55"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          <source src="/dashboard-vid.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay so text and glassmorphism remain readable */}
        <div className="absolute inset-0 bg-[#050816]/45 z-[1]" />
        {/* Ambient radial highlight */}
        <div className="absolute inset-0 z-[1]" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.06) 0%, transparent 60%)' }} />
      </div>

      <SpaceBackgroundCanvas />

      <Sidebar />
      <Navbar />
      <main
        className={`min-h-screen relative z-10 overflow-x-hidden transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pt-24 ${
          isMobile ? 'ml-0' : 'ml-64'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <AIAssistantWidget />
    </div>
  );
}
