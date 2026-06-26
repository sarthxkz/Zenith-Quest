'use client';

import { ReactNode, useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', hover = true, glow = false, onClick }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(pointer: fine)');
      setIsMobile(!mediaQuery.matches);
    }
  }, []);

  // Normal relative coordinates of mouse (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map mouse coordinate to spring-dampened rotations (max 6 degrees tilt for premium visual stability)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { damping: 25, stiffness: 200 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { damping: 25, stiffness: 200 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalize coordinates
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    x.set(mouseX / width);
    y.set(mouseY / height);

    // Provide pixel coordinates to CSS custom variables for radial spotlight glow
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: hover && !isMobile ? rotateX : 0,
        rotateY: hover && !isMobile ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={`
        ${hover && !isMobile ? 'glass-card cursor-none' : 'glass-card-static'} 
        ${glow ? 'animate-pulse-glow' : ''} 
        relative overflow-hidden p-5 sm:p-6 flex flex-col ${className}
      `}
    >
      {/* Reflective gloss swipe */}
      <div className="glass-shine" />
      
      {/* 3D Content depth */}
      <div style={{ transform: 'translateZ(12px)' }}>
        {children}
      </div>
    </motion.div>
  );
}
