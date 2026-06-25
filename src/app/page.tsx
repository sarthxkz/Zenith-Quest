'use client';

import dynamic from 'next/dynamic';
import HeroSection from '@/components/landing/HeroSection';
import FeatureShowcase from '@/components/landing/FeatureShowcase';

const StarField = dynamic(() => import('@/components/landing/StarField'), { ssr: false });

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <StarField />
      <HeroSection />
      <FeatureShowcase />

      {/* Footer */}
      <footer className="relative z-10 py-8 sm:py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-2">
          <p className="text-slate-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} Zenith Quest — Your Personal Sky Guide. Built for hackathon excellence.
          </p>
          <p className="text-slate-400 text-xs font-mono">
            Made with 🌌 by{' '}
            <a
              href="https://github.com/sarthxkz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 hover:underline cursor-none"
            >
              Sarthak (@sarthxkz)
            </a>{' '}
            &{' '}
            <a
              href="https://github.com/KumariS0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-none"
            >
              Shilpi (@KumariS0)
            </a>
          </p>
          <p className="text-slate-600 text-[10px] sm:text-xs mt-2">
            Powered by NASA, AstronomyAPI, N2YO, and OpenAI
          </p>
        </div>
      </footer>
    </main>
  );
}
