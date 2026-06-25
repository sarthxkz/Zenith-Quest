'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, UserButton } from '@clerk/nextjs';

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

interface Message {
  id: string;
  sender: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'notifications' | 'messages' | 'profile' | null>(null);
  
  // Custom user level stats
  const [dbUser, setDbUser] = useState<{ level: number; xp: number; rank: string } | null>(null);

  // Sample Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      type: 'satellite',
      title: '🛰️ ISS Overpass Incoming',
      description: 'Visible tonight at 21:42 (Mag: -3.8) in clear skies.',
      time: '10m ago',
      unread: true
    },
    {
      id: 'notif-2',
      type: 'aurora',
      title: '🌌 Solar Flare Event',
      description: 'Auroral activity spiked to Kp-6. High latitude visibility active.',
      time: '1h ago',
      unread: true
    },
    {
      id: 'notif-3',
      type: 'milestone',
      title: '🏆 Streak Milestone Unlocked',
      description: '7-Day Observation Streak achieved! +200 XP rewarded.',
      time: '3h ago',
      unread: false
    }
  ]);

  // Sample Messages State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'AstroLuna',
      avatar: '🌙',
      preview: 'Hey Sarthak, are you tracking the lunar transit tomorrow?',
      time: '12m ago',
      unread: true
    },
    {
      id: 'msg-2',
      sender: 'OrionNebula',
      avatar: '🌟',
      preview: 'The new high-resolution galaxy composite is complete. Take a look!',
      time: '2h ago',
      unread: false
    }
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for shrink effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch db profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setDbUser({
            level: data.level || 5,
            xp: data.xp || 1250,
            rank: data.rank || 'Night Watcher'
          });
        }
      } catch (err) {
        console.error('Error fetching DB profile for Navbar:', err);
      }
    };
    fetchProfile();
  }, [user]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Spotlight search keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === '/') {
        // Only trigger if not already typing in an input/textarea
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          setSearchOpen(true);
        }
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  const searchItems = [
    { name: 'Dashboard Home', path: '/dashboard', cat: 'Navigation' },
    { name: 'Satellites Tracker', path: '/satellites', cat: 'Navigation' },
    { name: 'Sky Dome Observatory', path: '/sky-dome', cat: 'Navigation' },
    { name: 'Missions Panel', path: '/missions', cat: 'Navigation' },
    { name: 'Astronomy Timeline', path: '/timeline', cat: 'Navigation' },
    { name: 'Profile Customs', path: '/profile', cat: 'Navigation' },
    { name: 'Telemetry Analytics', path: '/analytics', cat: 'Navigation' },
  ];

  const filteredItems = searchItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDropdown = (type: 'notifications' | 'messages') => {
    setActiveDropdown(prev => (prev === type ? null : type));
  };

  const handleDismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllNotifRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;
  const unreadMessagesCount = messages.filter(m => m.unread).length;

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] px-6 pt-4 pb-3 flex justify-between items-center left-0 lg:left-64`}
      >
        <div
          className={`w-full max-w-7xl mx-auto rounded-2xl glass transition-all duration-500 flex items-center justify-between px-6 py-3 border border-white/5 relative z-20 ${
            scrolled
              ? 'bg-[#050816]/75 shadow-lg shadow-purple-500/5 py-2.5 translate-y-1'
              : 'bg-transparent py-4 border-transparent shadow-none'
          }`}
        >
          {/* Status Display */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-slate-400 tracking-wider hidden sm:inline-block">
              ORBIT STATUS: <span className="text-emerald-400 font-semibold">STABLE</span>
            </span>
          </div>

          {/* Search Trigger (Apple/Linear Style) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex-1 max-w-sm mx-8 hidden md:flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 text-sm hover:border-purple-500/40 hover:bg-white/10 hover:text-slate-200 transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search cosmic data...</span>
            </div>
            <kbd className="text-[10px] bg-slate-900 border border-white/15 px-1.5 py-0.5 rounded text-slate-500 font-mono tracking-tighter">
              ⌘K
            </kbd>
          </button>

          {/* Right Action Icons & Profile Info */}
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            {/* Quick Level Badge */}
            {dbUser && (
              <div className="hidden sm:flex flex-col items-end justify-center font-mono">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-1">
                  {dbUser.rank}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-purple-400">Lvl {dbUser.level}</span>
                  <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                      style={{ width: `${(dbUser.xp % 1000) / 10}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('notifications')}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-slate-300 hover:text-purple-400 relative"
              >
                <svg className="w-5 h-5 animate-float-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white shadow shadow-purple-500/30">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {activeDropdown === 'notifications' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl glass border border-white/10 p-4 shadow-xl z-50 text-slate-200"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                      <h4 className="text-sm font-semibold">Telemetry Feeds</h4>
                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={markAllNotifRead}
                          className="text-[10px] text-purple-400 hover:text-purple-300 font-mono"
                        >
                          Clear Alert Badges
                        </button>
                      )}
                    </div>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs font-mono">
                          No orbital alerts detected.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl border transition-all text-xs relative group ${
                              n.unread
                                ? 'bg-purple-500/5 border-purple-500/10'
                                : 'bg-transparent border-transparent'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-slate-100">{n.title}</span>
                              <button
                                onClick={(e) => handleDismissNotification(n.id, e)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity font-mono text-[9px] p-0.5 ml-1"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="text-slate-400 mt-1 leading-relaxed">{n.description}</p>
                            <span className="text-[9px] font-mono text-slate-500 mt-1.5 block">{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Message Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('messages')}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-slate-300 hover:text-cyan-400 relative"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white shadow shadow-cyan-500/30">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {activeDropdown === 'messages' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl glass border border-white/10 p-4 shadow-xl z-50 text-slate-200"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                      <h4 className="text-sm font-semibold">Stargazer Comms</h4>
                      <Link href="/profile" className="text-[10px] text-cyan-400 hover:underline">
                        Open Chat Panel
                      </Link>
                    </div>
                    <div className="space-y-2.5">
                      {messages.map(m => (
                        <div
                          key={m.id}
                          className="flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-cyan-500/10 hover:bg-cyan-500/5 transition-all text-xs"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-sm flex-shrink-0">
                            {m.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-100">{m.sender}</span>
                              <span className="text-[9px] text-slate-500 font-mono">{m.time}</span>
                            </div>
                            <p className="text-slate-400 mt-0.5 truncate leading-relaxed">{m.preview}</p>
                          </div>
                          {m.unread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clerk Avatar & User Details Dropdown */}
            {isSignedIn ? (
              <div className="flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300">
                <UserButton />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/15 flex items-center justify-center text-xs text-purple-400">
                🌌
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spotlight Command Palette (Raycast / Stripe Style) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030014]/80 backdrop-blur-md flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl rounded-2xl glass border border-white/15 shadow-2xl overflow-hidden text-slate-200"
              onClick={e => e.stopPropagation()}
            >
              {/* Input Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search projects, telemetry, coordinates or tools..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-base placeholder-slate-500 w-full"
                />
                <span className="text-[10px] bg-slate-950 px-2 py-1 rounded border border-white/10 font-mono text-slate-500">
                  ESC
                </span>
              </div>

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-sm font-mono">
                    No results for &quot;<span className="text-purple-400">{searchQuery}</span>&quot;
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        router.push(item.path);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-purple-500/10 hover:border-purple-500/20 border border-transparent transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-1 rounded-lg bg-slate-900 border border-white/5 text-purple-400 text-xs">
                          {item.cat === 'Navigation' ? '🧭' : '✨'}
                        </span>
                        <span className="text-sm font-medium text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                        {item.path}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* Quick info footer */}
              <div className="bg-[#050816]/60 px-4 py-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>↑↓ to navigate · Enter to select</span>
                <span>Zenith Quest AI OS v1.2</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import Link from 'next/link';
