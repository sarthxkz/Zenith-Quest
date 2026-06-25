'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import SkyScoreGauge from '@/components/dashboard/SkyScoreGauge';
import WeatherCard from '@/components/dashboard/WeatherCard';
import MoonPhaseCard from '@/components/dashboard/MoonPhaseCard';
import PlanetCard from '@/components/dashboard/PlanetCard';
import SatelliteCard from '@/components/dashboard/SatelliteCard';
import AISummaryCard from '@/components/dashboard/AISummaryCard';
import SpaceFactsCarousel from '@/components/shared/SpaceFactsCarousel';
import GlassCard from '@/components/shared/GlassCard';
import { mockPlanets, mockMoonPhase, mockAPOD, mockNEOs, mockSolarActivity } from '@/lib/mock/mockAstronomy';
import { mockSatellitePasses } from '@/lib/mock/mockSatellites';
import { mockWeather } from '@/lib/mock/mockWeather';
import { mockDailyChallenge } from '@/lib/mock/mockMissions';
import { calculateSkyScore } from '@/lib/services/skyScoreEngine';
import { generateAISummary } from '@/lib/services/aiSummaryGenerator';
import { useLocationStore } from '@/lib/store/locationStore';

const LocationPicker = dynamic(() => import('@/components/shared/LocationPicker'), { ssr: false });

// Mock collaborative stargazing projects
const initialProjects = [
  {
    id: 'proj-1',
    title: 'Project Nebula Stream',
    description: 'High-speed telemetry processing node for orbital astrophotography stream.',
    status: 'Active',
    progress: 84,
    tech: ['Next.js', 'WebSockets', 'Rust'],
    members: ['🧑‍🚀 AstroSarthak', '👩‍🚀 LunaCoder', '👨‍💻 OrionDev'],
    cover: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(59,130,246,0.4) 100%)',
    lastActive: '2m ago'
  },
  {
    id: 'proj-2',
    title: 'Cosmic Tracker Web',
    description: 'Real-time satellite pass predictor with 3D canvas dome projection mapping.',
    status: 'Planning',
    progress: 42,
    tech: ['Three.js', 'React', 'TypeScript'],
    members: ['🧑‍🚀 AstroSarthak', '👽 XenonTech'],
    cover: 'linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(59,130,246,0.4) 100%)',
    lastActive: '1h ago'
  },
  {
    id: 'proj-3',
    title: 'Aphelion Engine',
    description: 'Predictive algorithm computing light pollution indexes using satellite imagery.',
    status: 'Staged',
    progress: 95,
    tech: ['Python', 'PyTorch', 'FastAPI'],
    members: ['🧑‍🚀 AstroSarthak', '👩‍🔬 JaneStar'],
    cover: 'linear-gradient(135deg, rgba(236,72,153,0.4) 0%, rgba(124,58,237,0.4) 100%)',
    lastActive: '1d ago'
  }
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded: isClerkLoaded } = useUser();
  const { currentLocation, requestGeolocation } = useLocationStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);
  const [projects, setProjects] = useState(initialProjects);
  const [apod, setApod] = useState<any>(mockAPOD);
  const [missions, setMissions] = useState([
    { id: 'm-1', task: 'Verify planet visibility conditions for Jupiter transit', reward: 50, done: false },
    { id: 'm-2', task: 'Run AI Telemetry analyzer on current ISS orbital trajectory', reward: 80, done: true },
    { id: 'm-3', task: 'Log 1 constellation observation under current Sky dome view', reward: 120, done: false }
  ]);
  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'projects' | 'timeline'>('overview');

  // Time sensitive greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return { text: 'Good Morning', icon: '☀️' };
    if (hr < 18) return { text: 'Good Afternoon', icon: '🌤️' };
    return { text: 'Good Evening', icon: '🌌' };
  };

  const greeting = getGreeting();

  const [skyScoreData, setSkyScoreData] = useState<any>(null);
  const [aiSummaryText, setAiSummaryText] = useState<string>('');
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  useEffect(() => {
    if (!currentLocation) {
      requestGeolocation();
    }
    // Simulate loading
    const timer = setTimeout(() => setIsLoaded(true), 250);
    return () => clearTimeout(timer);
  }, [currentLocation, requestGeolocation]);

  // Fetch live telemetry on coordinate updates
  useEffect(() => {
    if (!currentLocation) return;
    
    const fetchLiveData = async () => {
      setTelemetryLoading(true);
      try {
        const lat = currentLocation.latitude;
        const lng = currentLocation.longitude;
        
        const scoreRes = await fetch(`/api/sky-score?lat=${lat}&lng=${lng}`);
        if (scoreRes.ok) {
          const scoreData = await scoreRes.json();
          setSkyScoreData(scoreData);
        }
        
        const summaryRes = await fetch(`/api/ai-summary?lat=${lat}&lng=${lng}`);
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setAiSummaryText(summaryData.summary);
        }
      } catch (err) {
        console.error("Error fetching live dashboard telemetry:", err);
      } finally {
        setTelemetryLoading(false);
      }
    };
    
    fetchLiveData();
  }, [currentLocation]);

  // Fetch db profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setDbUser(data);
        }
      } catch (err) {
        console.error('Error loading profile in dashboard:', err);
      }
    };
    fetchProfile();
  }, [user]);

  // Fetch live NASA APOD
  useEffect(() => {
    const loadAPOD = async () => {
      try {
        const res = await fetch('/api/nasa?type=apod');
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            setApod(data);
          }
        }
      } catch (err) {
        console.error('Error fetching dynamic NASA APOD:', err);
      }
    };
    loadAPOD();
  }, []);

  const skyScore = skyScoreData?.skyScore || calculateSkyScore(mockWeather, mockMoonPhase, mockPlanets, mockSatellitePasses.length);
  const aiSummary = aiSummaryText || generateAISummary(mockWeather, mockMoonPhase, mockPlanets, mockSatellitePasses, skyScore);
  const weatherData = skyScoreData?.weather || mockWeather;
  const moonPhaseData = skyScoreData?.moonPhase || mockMoonPhase;
  const planetsData = skyScoreData?.planets || mockPlanets;
  const satellitePassesData = skyScoreData?.issPasses || mockSatellitePasses;

  const toggleMission = (id: string) => {
    setMissions(prev =>
      prev.map(m => {
        if (m.id === id) {
          const updated = !m.done;
          // Optimistically add XP if mission is checked
          if (updated && dbUser) {
            setDbUser((prevUser: any) => {
              if (!prevUser) return prevUser;
              const newXp = prevUser.xp + m.reward;
              const newLevel = Math.floor(newXp / 1000) + 1;
              return { ...prevUser, xp: newXp, level: newLevel };
            });
            // Update on db
            fetch('/api/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                xp: (dbUser.xp || 0) + m.reward,
                level: Math.floor(((dbUser.xp || 0) + m.reward) / 1000) + 1
              })
            }).catch(console.error);
          }
          return { ...m, done: updated };
        }
        return m;
      })
    );
  };

  const acceptDailyChallenge = () => {
    // Add to missions
    const newMission = {
      id: `m-challenge-${Date.now()}`,
      task: mockDailyChallenge.title,
      reward: mockDailyChallenge.xpReward,
      done: false
    };
    setMissions(prev => [newMission, ...prev]);
    // Show highlight alert
    alert('🎯 Mission accepted! Added to your Daily Missions.');
  };

  if (!isLoaded || !isClerkLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050816]">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full"
          />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">Syncing orbit state...</p>
        </div>
      </div>
    );
  }

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    if (!dbUser) return 40;
    let score = 30; // base (has account)
    if (dbUser.username) score += 15;
    if (dbUser.displayName) score += 10;
    if (dbUser.bio) score += 15;
    if (dbUser.skills?.length > 0) score += 15;
    if (dbUser.socialLinks?.github || dbUser.socialLinks?.website) score += 15;
    return Math.min(score, 100);
  };

  const completionPercent = getProfileCompletion();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      
      {/* Tab Selectors (Apple/Linear Style pill container) */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/5 w-fit">
        {(['overview', 'telemetry', 'projects', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all duration-300 relative cursor-none ${
              activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="active-dashboard-tab"
                className="absolute inset-0 rounded-lg bg-white/5 border border-white/10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            variants={stagger}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            {/* Coordinate Capture Station */}
            <motion.div variants={fadeUp}>
              <LocationPicker />
            </motion.div>

            {/* HERO SECTION */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Main greeting card */}
              <GlassCard className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between border-purple-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10 group-hover:bg-purple-500/15 transition-all duration-500" />
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full w-fit">
                    🌌 {currentLocation?.city || 'Detecting Coordinates...'}
                  </span>
                  <div className="space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                      {greeting.text}, {dbUser?.displayName || user?.fullName || 'Explorer'} {greeting.icon}
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
                      Ready to build something extraordinary today? The skies are clear and celestial alignments look perfect.
                    </p>
                  </div>
                </div>

                {/* Micro Info Ring Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Level Rank</span>
                    <p className="text-sm font-semibold text-slate-200">{dbUser?.rank || 'Night Watcher'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Active Streak</span>
                    <p className="text-sm font-semibold text-cyan-400">🔥 {dbUser?.currentStreak || 7} Days</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Observations</span>
                    <p className="text-sm font-semibold text-purple-400">🔭 {dbUser?.totalObservations || 23}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Profile Status</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-emerald-400">{completionPercent}%</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full max-w-[50px] overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${completionPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Progress Level Gauge */}
              <GlassCard className="lg:col-span-4 p-6 flex flex-col items-center justify-center text-center relative border-cyan-500/20">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="72" cy="72" r="64" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                    <motion.circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="url(#purpleCyanGrad)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={402}
                      initial={{ strokeDashoffset: 402 }}
                      animate={{ strokeDashoffset: 402 - (402 * ((dbUser?.xp || 1250) % 1000)) / 1000 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="score-ring"
                    />
                    <defs>
                      <linearGradient id="purpleCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-white tracking-tight">{dbUser?.level || 5}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Current Level</span>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-mono text-slate-400">
                    {(dbUser?.xp || 1250) % 1000} / 1000 XP
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {1000 - ((dbUser?.xp || 1250) % 1000)} XP to Next Level Up
                  </p>
                </div>
              </GlassCard>
            </motion.div>

            {/* QUICK ACTIONS & MISSIONS */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Quick Actions capsule buttons */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono">Quick Workspace Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/profile')}
                    className="group relative p-4 rounded-2xl border border-white/5 bg-slate-950/40 hover:bg-purple-500/5 hover:border-purple-500/30 transition-all duration-300 text-left cursor-none"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
                      🎨
                    </div>
                    <span className="text-xs font-semibold text-slate-200 block mb-1">Customize Card</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">Accent themes & username validation.</span>
                  </button>

                  <button
                    onClick={() => router.push('/satellites')}
                    className="group relative p-4 rounded-2xl border border-white/5 bg-slate-950/40 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all duration-300 text-left cursor-none"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
                      🛰️
                    </div>
                    <span className="text-xs font-semibold text-slate-200 block mb-1">Track Satellites</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">Real-time overpass times & telemetry alerts.</span>
                  </button>

                  <button
                    onClick={() => router.push('/sky-dome')}
                    className="group relative p-4 rounded-2xl border border-white/5 bg-slate-950/40 hover:bg-pink-500/5 hover:border-pink-500/30 transition-all duration-300 text-left cursor-none"
                  >
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
                      🔭
                    </div>
                    <span className="text-xs font-semibold text-slate-200 block mb-1">Explore Sky Dome</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">Virtual celestial maps & coordinate grids.</span>
                  </button>

                  <button
                    onClick={() => router.push('/timeline')}
                    className="group relative p-4 rounded-2xl border border-white/5 bg-slate-950/40 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all duration-300 text-left cursor-none"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
                      📡
                    </div>
                    <span className="text-xs font-semibold text-slate-200 block mb-1">Observation Feed</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">Share and log astronomical records.</span>
                  </button>
                </div>
              </div>

              {/* Daily Missions Checklist */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono">Today&apos;s Orbit Missions</h3>
                <GlassCard className="p-4 sm:p-5 space-y-3">
                  {missions.map(m => (
                    <div
                      key={m.id}
                      onClick={() => toggleMission(m.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 cursor-none ${
                        m.done
                          ? 'bg-emerald-500/5 border-emerald-500/10 opacity-60'
                          : 'bg-slate-900/50 border-white/5 hover:border-white/10 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors ${
                            m.done
                              ? 'bg-emerald-500 border-emerald-400 text-white'
                              : 'border-white/20 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                        <span className={`text-xs font-medium ${m.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {m.task}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-amber-400">+{m.reward} XP</span>
                      </div>
                    </div>
                  ))}
                </GlassCard>
              </div>
            </motion.div>

            {/* QUICK TELEMETRY PREVIEW & NASA IMAGE */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sky Score short card */}
              <div className="lg:col-span-4">
                <GlassCard className="flex flex-col items-center py-6 px-4 h-full relative group">
                  <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono">LIVE</div>
                  <SkyScoreGauge score={skyScore.overall} rating={skyScore.rating} />
                  <p className="text-xs text-slate-400 mt-4 text-center">
                    {skyScore.recommendation}
                  </p>
                  <button
                    onClick={() => setActiveTab('telemetry')}
                    className="mt-6 w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono uppercase tracking-widest text-slate-300 hover:bg-white/10 transition cursor-none"
                  >
                    View Detailed Telemetry
                  </button>
                </GlassCard>
              </div>

              {/* AI summary snippet */}
              <div className="lg:col-span-8">
                <AISummaryCard summary={aiSummary} />
              </div>
            </motion.div>

            {/* NASA APOD & SPACE FACTS */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <GlassCard className="h-full">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                    🔭 NASA Astronomy Picture of the Day
                  </h3>
                  <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-space-800">
                    <img
                      src={apod.url}
                      alt={apod.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/6/68/Barnard_33_%28Horsehead_Nebula%29.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-space-900/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="text-sm font-semibold text-white">{apod.title}</h4>
                      {apod.copyright && (
                        <p className="text-[10px] text-slate-400 mt-0.5">© {apod.copyright}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{apod.explanation}</p>
                </GlassCard>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                <SpaceFactsCarousel />
                <GlassCard className="gradient-border bg-amber-500/5">
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      CHALLENGE
                    </span>
                    <h4 className="text-sm font-semibold text-slate-200">{mockDailyChallenge.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{mockDailyChallenge.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-mono font-bold text-amber-400">+{mockDailyChallenge.xpReward} XP</span>
                      <button
                        onClick={acceptDailyChallenge}
                        className="text-xs btn-primary py-1.5 px-4 cursor-none"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* TELEMETRY VIEW */}
        {activeTab === 'telemetry' && (
          <motion.div
            key="telemetry"
            variants={stagger}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Live Weather and Climate */}
            <motion.div variants={fadeUp} className="lg:col-span-6"><WeatherCard weather={weatherData} /></motion.div>
            <motion.div variants={fadeUp} className="lg:col-span-6"><MoonPhaseCard moonPhase={moonPhaseData} /></motion.div>
            <motion.div variants={fadeUp} className="lg:col-span-6"><PlanetCard planets={planetsData} /></motion.div>
            <motion.div variants={fadeUp} className="lg:col-span-6"><SatelliteCard passes={satellitePassesData} /></motion.div>

            {/* Solar and Asteroids */}
            <motion.div variants={fadeUp} className="lg:col-span-6">
              <GlassCard className="h-full">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">☀️ Solar Flare Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400">Solar Flares (Week)</span>
                    <span className="text-sm font-medium text-amber-400">{mockSolarActivity.solarFlareCount} events</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400">Kp Index Level</span>
                    <span className="text-sm font-medium text-white">{mockSolarActivity.kpIndex}/9</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400">Solar Wind Velocity</span>
                    <span className="text-sm font-medium text-cyan-400">{mockSolarActivity.solarWindSpeed} km/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Geomagnetic Disturbance</span>
                    <span className="text-sm font-medium text-yellow-400 capitalize">{mockSolarActivity.geomagneticStorm}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={fadeUp} className="lg:col-span-6">
              <GlassCard className="h-full">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">☄️ Near Earth Asteroids Tracker</h3>
                <div className="space-y-3">
                  {mockNEOs.map((neo) => (
                    <div key={neo.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${neo.isPotentiallyHazardous ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white block">{neo.name}</span>
                          <span className="text-[10px] text-slate-500 block">Est: {neo.estimatedDiameter.min.toFixed(0)}-{neo.estimatedDiameter.max.toFixed(0)}m</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-mono text-slate-300 block">{parseFloat(neo.missDistance.lunar).toFixed(1)} LD</span>
                        <span className="text-[9px] text-slate-500 block">Miss Distance</span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <motion.div
            key="projects"
            variants={stagger}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Stargazing Collaboration Projects</h2>
                <p className="text-xs text-slate-500 mt-0.5">Build astronomy web tools and telemetry networks with teammates.</p>
              </div>
              <button
                onClick={() => {
                  const title = prompt('Enter project name:');
                  if (title) {
                    const newProj = {
                      id: `proj-${Date.now()}`,
                      title,
                      description: 'Collaborative telescope stream node and observation ledger.',
                      status: 'Planning',
                      progress: 10,
                      tech: ['Next.js', 'TailwindCSS'],
                      members: ['🧑‍🚀 AstroSarthak'],
                      cover: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(236,72,153,0.4) 100%)',
                      lastActive: 'Just now'
                    };
                    setProjects(prev => [newProj, ...prev]);
                  }
                }}
                className="btn-primary py-2 px-4 text-xs cursor-none"
              >
                + Create Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(p => (
                <GlassCard key={p.id} className="group relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                  {/* Banner background */}
                  <div
                    className="h-24 w-full relative"
                    style={{ background: p.cover }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050816] to-transparent" />
                    <span className="absolute top-3 right-3 text-[10px] font-mono bg-[#050816]/80 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md">
                      {p.status}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {p.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* Tech badges */}
                      <div className="flex flex-wrap gap-1">
                        {p.tech.map(t => (
                          <span key={t} className="text-[9px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-500">Progress</span>
                          <span className="text-slate-300 font-bold">{p.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer - active members and timestamps */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-2">
                      <div className="flex -space-x-2">
                        {p.members.map((m, idx) => (
                          <div
                            key={idx}
                            title={m}
                            className="w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px]"
                          >
                            {m.slice(0, 2)}
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">Active {p.lastActive}</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <motion.div
            key="timeline"
            variants={stagger}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="max-w-2xl mx-auto space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Cosmic Activity Logs</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status changes and achievements across the Zenith network.</p>
            </div>

            <div className="relative border-l border-white/5 ml-3 pl-6 space-y-6">
              {[
                { time: '2m ago', title: '🛰️ ISS Telemetry Received', desc: 'Overpass predictions matched successfully with sky coordinates.', type: 'alert' },
                { time: '1h ago', title: '🤝 Teammate Connection', desc: 'AstroLuna joined Project Nebula Stream as contributor.', type: 'team' },
                { time: '3h ago', title: '🔥 Streak Milestones Unlocked', desc: 'Logged 7 consecutive nights! Rewarded Night Watcher badge.', type: 'milestone' },
                { time: '1d ago', title: '☄️ NEO Hazard scan completed', desc: 'Solar telescopes scanned 18 asteroids. Orbit threat is clear.', type: 'system' }
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Pulse Dot */}
                  <span className="absolute -left-[30px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-950 border border-purple-500/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 group-hover:scale-125 transition-transform" />
                  </span>
                  <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/35 hover:bg-slate-900/60 hover:border-white/10 transition-all duration-300">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-xs font-semibold text-slate-100">{item.title}</h4>
                      <span className="text-[9px] font-mono text-slate-500">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
