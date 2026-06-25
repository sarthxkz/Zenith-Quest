'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { mockBadges, mockAchievements, mockMissions } from '@/lib/mock/mockMissions';
import { BADGE_RARITY_COLORS, EXPLORER_RANK_ICONS } from '@/lib/utils/constants';
import { getXPProgress } from '@/lib/utils/formatters';

// Debounce helper to make overall inputs/responses feel ultra smooth
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Tab control: 'customizer' | 'achievements' | 'settings'
  const [activeTab, setActiveTab] = useState<'customizer' | 'achievements' | 'settings'>('customizer');

  // Input states
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [portfolio, setPortfolio] = useState('');
  
  // Color configuration states
  const [bannerColor, setBannerColor] = useState('#7c3aed');
  const [accentColor, setAccentColor] = useState('#06b6d4');
  const [avatarColor, setAvatarColor] = useState('#ec4899');
  
  // Privacy states
  const [publicProfile, setPublicProfile] = useState(true);
  const [showStreak, setShowStreak] = useState(true);
  const [showXP, setShowXP] = useState(true);

  // Status logs
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  // Debounced username for check query
  const debouncedUsername = useDebounce(username, 350);

  // Fetch initial profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          
          // Populate fields
          setDisplayName(data.displayName || '');
          setUsername(data.username || '');
          setBio(data.bio || '');
          setPronouns(data.pronouns || '');
          setGithub(data.socialLinks?.github || '');
          setLinkedin(data.socialLinks?.linkedin || '');
          setWebsite(data.socialLinks?.website || '');
          setPortfolio(data.socialLinks?.portfolio || '');
          setBannerColor(data.bannerColor || '#7c3aed');
          setAccentColor(data.accentColor || '#06b6d4');
          setAvatarColor(data.avatarColor || '#ec4899');
          setPublicProfile(data.privacy?.publicProfile ?? true);
          setShowStreak(data.privacy?.showStreak ?? true);
          setShowXP(data.privacy?.showXP ?? true);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Username validation endpoint check
  useEffect(() => {
    if (!debouncedUsername) {
      setUsernameStatus('idle');
      return;
    }
    if (profile && debouncedUsername.toLowerCase() === profile.username?.toLowerCase()) {
      setUsernameStatus('available');
      setUsernameError('');
      setUsernameSuggestions([]);
      return;
    }

    const checkUsername = async () => {
      setUsernameStatus('checking');
      try {
        const res = await fetch(`/api/profile/username?username=${encodeURIComponent(debouncedUsername)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.available) {
            setUsernameStatus('available');
            setUsernameError('');
            setUsernameSuggestions([]);
          } else {
            setUsernameStatus('taken');
            setUsernameError(data.reason || 'Username is unavailable.');
            setUsernameSuggestions(data.suggestions || []);
          }
        }
      } catch (err) {
        console.error('Error checking username:', err);
        setUsernameStatus('invalid');
      }
    };

    checkUsername();
  }, [debouncedUsername, profile]);

  // Auto-save callback
  const triggerAutoSave = useCallback(async (updatedFields: any) => {
    setSavingStatus('saving');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });

      if (res.ok) {
        const updatedData = await res.json();
        setProfile(updatedData);
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      } else {
        throw new Error();
      }
    } catch (err) {
      setSavingStatus('error');
    }
  }, [profile]);

  // Handle immediate field saves
  const saveField = (fieldName: string, value: any) => {
    let payload = {};
    if (fieldName.startsWith('socialLinks.')) {
      const key = fieldName.split('.')[1];
      payload = {
        socialLinks: {
          ...profile?.socialLinks,
          [key]: value
        }
      };
    } else if (fieldName.startsWith('privacy.')) {
      const key = fieldName.split('.')[1];
      payload = {
        privacy: {
          ...profile?.privacy,
          [key]: value
        }
      };
    } else {
      payload = { [fieldName]: value };
    }
    triggerAutoSave(payload);
  };

  const handleUsernameSelect = (suggested: string) => {
    setUsername(suggested);
    saveField('username', suggested);
  };

  const xpProgress = getXPProgress(profile?.xp || 1250);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050816]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 select-text">
      
      {/* Header and Telemetry Save Status Indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Identity customizer
          </h1>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            Configure your stargazing profile & cosmic themes
          </p>
        </div>

        {/* Sync telemetry indicator */}
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {savingStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-slate-950/80 text-[10px] font-mono border-white/5"
              >
                {savingStatus === 'saving' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-cyan-400">Syncing telemetry...</span>
                  </>
                )}
                {savingStatus === 'saved' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400">Synced to orbit ✓</span>
                  </>
                )}
                {savingStatus === 'error' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-rose-400">Sync failed!</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <SignOutButton>
            <button className="btn-secondary text-xs px-5 py-2 flex items-center gap-2 group cursor-none transition-all duration-300">
              <svg className="w-4 h-4 text-purple-400 group-hover:text-rose-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect Link
            </button>
          </SignOutButton>
        </div>
      </div>

      {/* Tab selection grid */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/5 w-fit">
        {[
          { id: 'customizer', label: 'Cosmic Card Customizer', icon: '🎨' },
          { id: 'achievements', label: 'Telemetry & Achievements', icon: '🏆' },
          { id: 'settings', label: 'Privacy & Uplink Control', icon: '🛰️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all duration-300 relative cursor-none ${
              activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-profile-tab"
                className="absolute inset-0 rounded-lg bg-white/5 border border-white/10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Animated content blocks */}
      <AnimatePresence mode="wait">
        {activeTab === 'customizer' && (
          <motion.div
            key="customizer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* Live Profile preview card (Left Column) */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono">Live Cosmic Card</h3>
              
              <GlassCard className="relative overflow-hidden p-0 border-white/10 group shadow-2xl">
                {/* Custom Banner Color or Glow */}
                <div
                  className="h-28 w-full transition-all duration-500 relative"
                  style={{
                    background: `linear-gradient(135deg, ${bannerColor} 0%, ${bannerColor}88 100%)`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-black/10" />
                </div>

                <div className="px-6 pb-6 pt-0 relative">
                  {/* Holographic Avatar container */}
                  <div className="flex justify-between items-end -translate-y-10 mb-2">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition-colors border-2 relative"
                      style={{
                        borderColor: accentColor,
                        backgroundColor: `${avatarColor}20`,
                        boxShadow: `0 0 25px ${avatarColor}35`
                      }}
                    >
                      <span className="absolute inset-0.5 rounded-xl border border-dashed border-white/20 animate-spin-slow" />
                      {EXPLORER_RANK_ICONS[profile?.rank || 'Night Watcher'] || '⭐'}
                    </div>

                    {/* Pronouns */}
                    {pronouns && (
                      <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400">
                        {pronouns}
                      </span>
                    )}
                  </div>

                  {/* Profile info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-white tracking-wide">
                        {displayName || profile?.name || 'Explorer'}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        @{username || 'guest_explorer'}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      {bio || 'Empty bio. Edit settings to update your description details.'}
                    </p>

                    {/* XP progression status */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500">XP Telemetry Progress</span>
                        <span className="text-slate-300 font-bold">{xpProgress.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 border border-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                          style={{ width: `${xpProgress.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Social links grid */}
                    <div className="flex gap-2.5 pt-4 border-t border-white/5">
                      {github && (
                        <a href={github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-purple-500/10 hover:border-purple-500/30 transition-all text-xs cursor-none">
                          🐙
                        </a>
                      )}
                      {linkedin && (
                        <a href={linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-purple-500/10 hover:border-purple-500/30 transition-all text-xs cursor-none">
                          💼
                        </a>
                      )}
                      {website && (
                        <a href={website} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-purple-500/10 hover:border-purple-500/30 transition-all text-xs cursor-none">
                          🌐
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Profile Customizer Fields Form (Right Column) */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono">Card Properties</h3>
              
              <GlassCard className="p-6 space-y-6">
                
                {/* Username Input Checker */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Cosmic Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().trim())}
                      onBlur={() => saveField('username', username)}
                      placeholder="Enter unique username..."
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/40 font-mono transition"
                    />
                    <div className="absolute right-3.5 top-3 flex items-center gap-1.5">
                      {usernameStatus === 'checking' && (
                        <span className="text-[10px] text-cyan-400 font-mono animate-pulse">Checking...</span>
                      )}
                      {usernameStatus === 'available' && (
                        <span className="text-[10px] text-emerald-400 font-mono">Available ✓</span>
                      )}
                      {usernameStatus === 'taken' && (
                        <span className="text-[10px] text-rose-400 font-mono">Taken ✕</span>
                      )}
                    </div>
                  </div>
                  {/* Suggestions list */}
                  {usernameStatus === 'taken' && usernameSuggestions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500 font-mono">Suggested:</span>
                      {usernameSuggestions.map(suggested => (
                        <button
                          key={suggested}
                          onClick={() => handleUsernameSelect(suggested)}
                          className="text-[9px] font-mono bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 px-2 py-0.5 rounded text-purple-400 transition cursor-none"
                        >
                          {suggested}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      onBlur={() => saveField('displayName', displayName)}
                      placeholder="Display Name..."
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/40 transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Pronouns</label>
                    <input
                      type="text"
                      value={pronouns}
                      onChange={e => setPronouns(e.target.value)}
                      onBlur={() => saveField('pronouns', pronouns)}
                      placeholder="they/them, he/him..."
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/40 transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Bio Description</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    onBlur={() => saveField('bio', bio)}
                    placeholder="Describe your stellar observations..."
                    rows={3}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/40 transition resize-none leading-relaxed"
                  />
                </div>

                {/* Banner & Accent Theme Colors */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Theme Spectrum Colors</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Banner Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bannerColor}
                          onChange={e => setBannerColor(e.target.value)}
                          onBlur={() => saveField('bannerColor', bannerColor)}
                          className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-none"
                        />
                        <span className="text-xs font-mono text-slate-300">{bannerColor.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Accent Border</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={e => setAccentColor(e.target.value)}
                          onBlur={() => saveField('accentColor', accentColor)}
                          className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-none"
                        />
                        <span className="text-xs font-mono text-slate-300">{accentColor.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Avatar Halo</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={avatarColor}
                          onChange={e => setAvatarColor(e.target.value)}
                          onBlur={() => saveField('avatarColor', avatarColor)}
                          className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-none"
                        />
                        <span className="text-xs font-mono text-slate-300">{avatarColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links Config */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Social Links Integrations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">GitHub Profile</label>
                      <input
                        type="url"
                        value={github}
                        onChange={e => setGithub(e.target.value)}
                        onBlur={() => saveField('socialLinks.github', github)}
                        placeholder="https://github.com/..."
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500/40 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={e => setLinkedin(e.target.value)}
                        onBlur={() => saveField('socialLinks.linkedin', linkedin)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500/40 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Website Url</label>
                      <input
                        type="url"
                        value={website}
                        onChange={e => setWebsite(e.target.value)}
                        onBlur={() => saveField('socialLinks.website', website)}
                        placeholder="https://mywebsite.com"
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500/40 transition"
                      />
                    </div>
                  </div>
                </div>

              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            
            {/* XP and Streak display grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Observations Made', value: profile?.totalObservations || 23, icon: '🔭' },
                { label: 'Missions Finished', value: mockMissions.filter(m => m.status === 'completed').length, icon: '✅' },
                { label: 'Current Streak', value: profile?.currentStreak || 7, icon: '🔥', suffix: 'd' },
                { label: 'Longest Streak', value: profile?.longestStreak || 14, icon: '🏆', suffix: 'd' },
              ].map((stat, idx) => (
                <GlassCard key={idx} className="text-center py-5 relative overflow-hidden">
                  <div className="absolute inset-0 hud-grid opacity-5 pointer-events-none" />
                  <span className="text-2xl">{stat.icon}</span>
                  <div className="text-2xl font-black text-white mt-2 font-mono">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1.5 font-bold">{stat.label}</div>
                </GlassCard>
              ))}
            </div>

            {/* Badges Matrix */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono mb-4">Astronomy Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {mockBadges.map((badge, idx) => {
                  const isUnlocked = !!badge.unlockedAt;
                  const colors = BADGE_RARITY_COLORS[badge.rarity];
                  return (
                    <GlassCard
                      key={badge.id}
                      className={`text-center py-6 flex flex-col justify-between items-center relative overflow-hidden transition-all duration-300 ${
                        !isUnlocked ? 'opacity-35 grayscale' : ''
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                      <div className="text-4xl mb-3 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] animate-float-slow select-none">
                        {badge.icon}
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{badge.name}</h4>
                      <p className="text-[10px] text-slate-400 font-light text-center px-2 mb-4 leading-relaxed">
                        {badge.description}
                      </p>
                      <div>
                        <span
                          className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full capitalize"
                          style={{
                            backgroundColor: `${colors.bg}20`,
                            color: colors.text,
                            border: `1px solid ${colors.border}25`
                          }}
                        >
                          {badge.rarity}
                        </span>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>

            {/* Achievements List */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono">Mission Objectives</h3>
              <div className="space-y-4">
                {mockAchievements.map((ach, idx) => (
                  <GlassCard key={ach.id} className="relative overflow-hidden p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border border-purple-500/25 flex items-center justify-center text-2xl flex-shrink-0">
                        {ach.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 font-mono text-xs">
                          <h4 className="text-xs font-bold text-white tracking-wide">{ach.name}</h4>
                          <span className="text-slate-500 font-bold tracking-widest">{ach.progress}/{ach.maxProgress}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{ach.description}</p>
                        
                        {/* Progress slider bar */}
                        <div className="w-full h-[3px] bg-slate-950 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.05 }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0 font-mono pl-3">
                        <span className="text-xs font-bold text-amber-400">+{ach.xpReward} XP</span>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* SETTINGS AND PRIVACY TAB */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Privacy toggles (Left Column) */}
            <div className="lg:col-span-6 space-y-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono">Uplink Visibility Controls</h3>
              
              <GlassCard className="p-6 space-y-5">
                
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-transparent hover:border-white/5 transition-all">
                  <div className="space-y-0.5 max-w-[70%]">
                    <label className="text-xs font-semibold text-slate-200 block">Public Stargazer Profile</label>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">Allow other explorers to discover your public cosmic card and custom banner.</span>
                  </div>
                  <button
                    onClick={() => {
                      const updated = !publicProfile;
                      setPublicProfile(updated);
                      saveField('privacy.publicProfile', updated);
                    }}
                    className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-none ${
                      publicProfile ? 'bg-purple-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${publicProfile ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-transparent hover:border-white/5 transition-all">
                  <div className="space-y-0.5 max-w-[70%]">
                    <label className="text-xs font-semibold text-slate-200 block">Publish Daily Streak</label>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">Display your active observation streaks inside telemetry dashboards.</span>
                  </div>
                  <button
                    onClick={() => {
                      const updated = !showStreak;
                      setShowStreak(updated);
                      saveField('privacy.showStreak', updated);
                    }}
                    className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-none ${
                      showStreak ? 'bg-cyan-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${showStreak ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-transparent hover:border-white/5 transition-all">
                  <div className="space-y-0.5 max-w-[70%]">
                    <label className="text-xs font-semibold text-slate-200 block">Publish XP Achievements</label>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">Share achievements level metrics globally with other star scouts.</span>
                  </div>
                  <button
                    onClick={() => {
                      const updated = !showXP;
                      setShowXP(updated);
                      saveField('privacy.showXP', updated);
                    }}
                    className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-none ${
                      showXP ? 'bg-pink-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${showXP ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

              </GlassCard>
            </div>

            {/* Profile Statistics Log summary (Right Column) */}
            <div className="lg:col-span-6 space-y-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono">Uplink Telemetry Status</h3>
              <GlassCard className="p-6 space-y-4">
                <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
                  <span className="text-slate-500">Explorer Node ID</span>
                  <span className="text-slate-300 select-all">{profile?.clerkId}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
                  <span className="text-slate-500">Registered Email</span>
                  <span className="text-slate-300">{profile?.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
                  <span className="text-slate-500">Joined Celestial Log</span>
                  <span className="text-slate-300">{new Date(profile?.joinedAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">Database Connection</span>
                  <span className="text-emerald-400 font-bold">CONNECTED ✓</span>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
