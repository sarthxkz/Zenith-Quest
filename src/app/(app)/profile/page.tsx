'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { mockBadges, mockAchievements, mockMissions } from '@/lib/mock/mockMissions';
import { BADGE_RARITY_COLORS, EXPLORER_RANK_ICONS } from '@/lib/utils/constants';
import { getXPProgress, getLevelFromXP } from '@/lib/utils/formatters';

// SWR fetcher — simple JSON fetch
const fetcher = (url: string) => fetch(url).then(r => { if (!r.ok) throw new Error(); return r.json(); });

// Precompute static values outside the component
const completedMissionCount = mockMissions.filter(m => m.status === 'completed').length;

// ─── Constants ───────────────────────────────────────────────────────
const BIO_MAX_LENGTH = 280;

const BANNER_PRESETS = [
  '#7c3aed', '#6d28d9', '#4f46e5', '#2563eb', '#0891b2',
  '#059669', '#d97706', '#dc2626', '#db2777', '#9333ea',
];

const ACCENT_PRESETS = [
  '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899',
  '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316', '#a855f7',
];

const BANNER_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${(i * 13.2 + 5) % 100}%`,
  top: `${(i * 11.5 + 10) % 85}%`,
  delay: `${-(i * 0.6)}s`,
}));

// ─── Debounce hook ───────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Skeleton Components ─────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="profile-skeleton h-8 w-64 rounded-lg" />
          <div className="profile-skeleton h-4 w-48 rounded-md" />
        </div>
        <div className="profile-skeleton h-10 w-36 rounded-xl" />
      </div>

      {/* Tabs skeleton */}
      <div className="profile-skeleton h-12 w-[500px] max-w-full rounded-xl" />

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Profile card skeleton */}
        <div className="lg:col-span-5 space-y-4">
          <div className="profile-skeleton h-4 w-32 rounded" />
          <div className="glass-card-static rounded-2xl overflow-hidden">
            {/* Banner */}
            <div className="profile-skeleton h-36 w-full rounded-none" />
            <div className="p-6 space-y-4">
              {/* Avatar + name */}
              <div className="flex items-end gap-4 -mt-14">
                <div className="profile-skeleton w-24 h-24 rounded-full flex-shrink-0" />
                <div className="space-y-2 pb-1">
                  <div className="profile-skeleton h-6 w-40 rounded" />
                  <div className="profile-skeleton h-3 w-24 rounded" />
                </div>
              </div>
              {/* Bio */}
              <div className="profile-skeleton h-12 w-full rounded-lg" />
              {/* XP bar */}
              <div className="profile-skeleton h-8 w-full rounded-lg" />
              {/* Social */}
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="profile-skeleton w-9 h-9 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="profile-skeleton h-4 w-32 rounded" />
          <div className="glass-card-static rounded-2xl p-6 space-y-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="profile-skeleton h-3 w-28 rounded" />
                <div className="profile-skeleton h-10 w-full rounded-xl" />
              </div>
            ))}
            <div className="grid grid-cols-3 gap-3 pt-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="profile-skeleton h-3 w-20 rounded" />
                  <div className="profile-skeleton h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stagger animation variants (fast) ──────────────────────────────
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Main Profile Page ───────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useUser();

  // SWR: cached + revalidates in background → instant on revisit
  const { data: profile, mutate, isLoading: loading } = useSWR('/api/profile', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  // Tab control
  const [activeTab, setActiveTab] = useState<'customizer' | 'achievements' | 'settings'>('customizer');

  // Input states — hydrated from profile once loaded
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');

  // Color states
  const [bannerColor, setBannerColor] = useState('#7c3aed');
  const [accentColor, setAccentColor] = useState('#06b6d4');
  const [avatarColor, setAvatarColor] = useState('#ec4899');

  // Privacy states
  const [publicProfile, setPublicProfile] = useState(true);
  const [showStreak, setShowStreak] = useState(true);
  const [showXP, setShowXP] = useState(true);

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  // Status
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  // Debounced values (username only — other fields use explicit Save)
  const debouncedUsername = useDebounce(username, 350);

  // Track whether we've hydrated form fields from profile data
  const hydratedRef = useRef(false);

  // ─── Hydrate form fields when profile loads ─────────────────────
  useEffect(() => {
    if (!profile || hydratedRef.current) return;
    hydratedRef.current = true;
    setDisplayName(profile.displayName || '');
    setUsername(profile.username || '');
    setBio(profile.bio || '');
    setPronouns(profile.pronouns || '');
    setGithub(profile.socialLinks?.github || '');
    setLinkedin(profile.socialLinks?.linkedin || '');
    setWebsite(profile.socialLinks?.website || '');
    setBannerColor(profile.bannerColor || '#7c3aed');
    setAccentColor(profile.accentColor || '#06b6d4');
    setAvatarColor(profile.avatarColor || '#ec4899');
    setPublicProfile(profile.privacy?.publicProfile ?? true);
    setShowStreak(profile.privacy?.showStreak ?? true);
    setShowXP(profile.privacy?.showXP ?? true);
    if (profile.avatar) setAvatarPreview(profile.avatar);
  }, [profile]);

  // ─── Username check ─────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedUsername) { setUsernameStatus('idle'); return; }
    if (profile && debouncedUsername.toLowerCase() === profile.username?.toLowerCase()) {
      setUsernameStatus('available');
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
            setUsernameSuggestions([]);
          } else {
            setUsernameStatus('taken');
            setUsernameSuggestions(data.suggestions || []);
          }
        }
      } catch {
        setUsernameStatus('invalid');
      }
    };
    checkUsername();
  }, [debouncedUsername, profile]);

  // ─── Dirty-state detection ──────────────────────────────────────
  const hasUnsavedChanges = useMemo(() => {
    if (!profile) return false;
    return (
      displayName !== (profile.displayName || '') ||
      username !== (profile.username || '') ||
      bio !== (profile.bio || '') ||
      pronouns !== (profile.pronouns || '') ||
      github !== (profile.socialLinks?.github || '') ||
      linkedin !== (profile.socialLinks?.linkedin || '') ||
      website !== (profile.socialLinks?.website || '') ||
      bannerColor !== (profile.bannerColor || '#7c3aed') ||
      accentColor !== (profile.accentColor || '#06b6d4')
    );
  }, [profile, displayName, username, bio, pronouns, github, linkedin, website, bannerColor, accentColor]);

  // ─── Save helpers (must be declared before saveAllFields) ───────
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
        // Update SWR cache directly — no refetch needed
        mutate(updatedData, false);
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      } else {
        throw new Error();
      }
    } catch {
      setSavingStatus('error');
      setTimeout(() => setSavingStatus('idle'), 3000);
    }
  }, [mutate]);

  const saveField = (fieldName: string, value: any) => {
    let payload: Record<string, any> = {};
    if (fieldName.startsWith('socialLinks.')) {
      const key = fieldName.split('.')[1];
      payload = { socialLinks: { ...profile?.socialLinks, [key]: value } };
    } else if (fieldName.startsWith('privacy.')) {
      const key = fieldName.split('.')[1];
      payload = { privacy: { ...profile?.privacy, [key]: value } };
    } else {
      payload = { [fieldName]: value };
    }
    triggerAutoSave(payload);
  };

  // ─── Save all fields at once ────────────────────────────────────
  const saveAllFields = useCallback(() => {
    triggerAutoSave({
      displayName,
      username,
      bio,
      pronouns,
      bannerColor,
      accentColor,
      socialLinks: { github, linkedin, website },
    });
  }, [triggerAutoSave, displayName, username, bio, pronouns, bannerColor, accentColor, github, linkedin, website]);

  // ─── Reset all fields to saved profile values ───────────────────
  const resetAllFields = useCallback(() => {
    if (!profile) return;
    setDisplayName(profile.displayName || '');
    setUsername(profile.username || '');
    setBio(profile.bio || '');
    setPronouns(profile.pronouns || '');
    setGithub(profile.socialLinks?.github || '');
    setLinkedin(profile.socialLinks?.linkedin || '');
    setWebsite(profile.socialLinks?.website || '');
    setBannerColor(profile.bannerColor || '#7c3aed');
    setAccentColor(profile.accentColor || '#06b6d4');
    setSavingStatus('idle');
  }, [profile]);

  const handleUsernameSelect = (suggested: string) => {
    setUsername(suggested);
    saveField('username', suggested);
  };

  // ─── Avatar upload ──────────────────────────────────────────────
  const handleAvatarUpload = async (file: File) => {
    // Optimistic preview
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setAvatarPreview(data.avatar);
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 1500);
      } else {
        const errorData = await res.json();
        console.error('Avatar upload failed:', errorData.error);
        setSavingStatus('error');
        setTimeout(() => setSavingStatus('idle'), 3000);
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      setSavingStatus('error');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarUpload(file);
    e.target.value = '';
  };

  // ─── Bio auto-resize ───────────────────────────────────────────
  const autoResizeBio = useCallback(() => {
    if (bioRef.current) {
      bioRef.current.style.height = 'auto';
      bioRef.current.style.height = `${Math.min(bioRef.current.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => { autoResizeBio(); }, [bio, autoResizeBio]);

  // ─── Computed values ────────────────────────────────────────────
  const xpProgress = useMemo(() => getXPProgress(profile?.xp || 1250), [profile?.xp]);
  const level = useMemo(() => getLevelFromXP(profile?.xp || 1250), [profile?.xp]);
  const bioWordCount = useMemo(() => bio.trim() ? bio.trim().split(/\s+/).length : 0, [bio]);
  const avatarSrc = avatarPreview || user?.imageUrl || '';
  const rankIcon = EXPLORER_RANK_ICONS[profile?.rank || 'Night Watcher'] || '⭐';

  // ─── Loading state ─────────────────────────────────────────────
  if (loading) return <ProfileSkeleton />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 select-text">

      {/* ═══ Page Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1
            className="text-3xl font-extrabold text-white mb-1 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Mission Control
          </h1>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            Configure your explorer identity & cosmic themes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sync status indicator */}
          <AnimatePresence mode="wait">
            {savingStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
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
              Disconnect
            </button>
          </SignOutButton>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.02, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-white/5 w-full sm:w-fit overflow-x-auto no-scrollbar"
      >
        {[
          { id: 'customizer', label: 'Identity Hub', icon: '🪪' },
          { id: 'achievements', label: 'Achievements', icon: '🏆' },
          { id: 'settings', label: 'Settings', icon: '⚙️' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-all duration-300 relative cursor-none whitespace-nowrap ${
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
      </motion.div>

      {/* ═══ Tab Content ═══ */}
      <AnimatePresence mode="wait">

        {/* ──────────── CUSTOMIZER TAB ──────────── */}
        {activeTab === 'customizer' && (
          <motion.div
            key="customizer"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >

            {/* ═══ Left Column: Live Profile Card ═══ */}
            <motion.div variants={staggerItem} className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Preview
              </h3>

              <GlassCard className="relative overflow-hidden p-0 border-white/10 shadow-2xl">
                {/* ── Animated Banner ── */}
                <div
                  className="h-36 w-full relative overflow-hidden transition-all duration-700"
                  style={{
                    background: `linear-gradient(135deg, ${bannerColor} 0%, ${bannerColor}99 40%, ${bannerColor}55 100%)`,
                  }}
                >
                  {/* Floating particles */}
                  {BANNER_PARTICLES.map(p => (
                    <div
                      key={p.id}
                      className="banner-particle"
                      style={{ left: p.left, top: p.top, animationDelay: p.delay }}
                    />
                  ))}
                  {/* Gradient overlay fade to card */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070B24] via-transparent to-black/20" />
                  {/* Accent shimmer line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] opacity-40"
                    style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
                  />
                </div>

                <div className="px-6 pb-6 pt-0 relative">
                  {/* ── Avatar with Upload ── */}
                  <div className="flex flex-wrap items-end justify-between -translate-y-12 mb-0 gap-4">
                    <div
                      className="avatar-upload-wrapper relative cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div
                        className="w-24 h-24 rounded-full relative flex items-center justify-center text-4xl overflow-hidden"
                        style={{
                          backgroundColor: `${avatarColor}15`,
                          boxShadow: `0 0 30px ${avatarColor}25`,
                        }}
                      >
                        {/* Animated ring */}
                        <div className="profile-avatar-ring" />

                        {/* Avatar image or rank icon */}
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full relative z-[1]"
                          />
                        ) : (
                          <span className="relative z-[1] select-none">{rankIcon}</span>
                        )}

                        {/* Upload overlay */}
                        <div className="avatar-upload-overlay">
                          {avatarUploading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                            />
                          ) : (
                            <>
                              <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                              </svg>
                              <span className="text-[9px] text-white/80 font-medium tracking-wide">CHANGE</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Rank badge */}
                      <div
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm z-20 rank-badge-glow"
                        style={{
                          background: `linear-gradient(135deg, ${bannerColor}, ${accentColor})`,
                          border: '2px solid rgba(7, 11, 36, 0.8)',
                        }}
                      >
                        {rankIcon}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Rank + Pronouns */}
                    <div className="flex items-center gap-2 mb-1">
                      {pronouns && (
                        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400">
                          {pronouns}
                        </span>
                      )}
                      <span
                        className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wide"
                        style={{
                          background: `linear-gradient(135deg, ${bannerColor}30, ${accentColor}20)`,
                          color: accentColor,
                          border: `1px solid ${accentColor}30`,
                        }}
                      >
                        {profile?.rank || 'Stargazer'}
                      </span>
                    </div>
                  </div>

                  {/* ── Profile Info ── */}
                  <div className="space-y-4 -mt-6">
                    <div>
                      <h4 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                        {displayName || profile?.name || 'Explorer'}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        @{username || 'explorer'} · Level {level}
                      </p>
                    </div>

                    {/* Bio display */}
                    <p className="text-[13px] text-slate-300/80 leading-relaxed font-light">
                      {bio || (
                        <span className="text-slate-600 italic">No bio yet. Tell the cosmos about yourself...</span>
                      )}
                    </p>

                    {/* XP Progress */}
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-purple-500" />
                          Level {level} → {level + 1}
                        </span>
                        <span className="text-slate-300 font-bold">
                          <AnimatedCounter value={Math.round(xpProgress.percentage)} suffix="%" />
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-950/80 border border-white/5 rounded-full overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-full relative"
                          style={{
                            background: `linear-gradient(90deg, ${bannerColor}, ${accentColor})`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${xpProgress.percentage}%` }}
                          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                        >
                          {/* Shimmer on progress bar */}
                          <div
                            className="absolute inset-0 opacity-40"
                            style={{
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                              backgroundSize: '200% 100%',
                              animation: 'gradient-shift 2s ease infinite',
                            }}
                          />
                        </motion.div>
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-600">
                        <span>{xpProgress.current} XP</span>
                        <span>{xpProgress.required} XP needed</span>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-2.5 pt-3 border-t border-white/5">
                      {github && (
                        <a href={github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-purple-500/15 hover:border-purple-500/30 transition-all text-sm cursor-none hover:scale-110">
                          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                      )}
                      {linkedin && (
                        <a href={linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/15 hover:border-blue-500/30 transition-all text-sm cursor-none hover:scale-110">
                          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                      )}
                      {website && (
                        <a href={website} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyan-500/15 hover:border-cyan-500/30 transition-all text-sm cursor-none hover:scale-110">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-4.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.467.732-3.561" /></svg>
                        </a>
                      )}
                      {!github && !linkedin && !website && (
                        <span className="text-[10px] text-slate-600 font-mono italic py-2">No social links added yet</span>
                      )}
                    </div>

                    {/* Join date */}
                    <div className="text-[9px] text-slate-600 font-mono pt-1">
                      Joined {new Date(profile?.joinedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* ═══ Right Column: Editor ═══ */}
            <motion.div variants={staggerItem} className="lg:col-span-7 space-y-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Edit Profile
              </h3>

              <GlassCard className="p-6 space-y-6 bg-[#040616]/65 border-white/[0.04]" hover={false}>

                {/* ── Identity Section ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono uppercase tracking-widest font-semibold">
                    <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                    Identity
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-mono">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        onBlur={() => saveField('username', username)}
                        placeholder="your_username"
                        className="profile-input pl-8 font-mono text-xs"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {usernameStatus === 'checking' && (
                          <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="text-[10px] text-cyan-400 font-mono">
                            Checking...
                          </motion.span>
                        )}
                        {usernameStatus === 'available' && (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Available
                          </span>
                        )}
                        {usernameStatus === 'taken' && (
                          <span className="text-[10px] text-rose-400 font-mono flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            Taken
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Suggestions */}
                    {usernameStatus === 'taken' && usernameSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-wrap items-center gap-1.5 pt-1"
                      >
                        <span className="text-[10px] text-slate-600 font-mono">Try:</span>
                        {usernameSuggestions.map(s => (
                          <button
                            key={s}
                            onClick={() => handleUsernameSelect(s)}
                            className="text-[9px] font-mono bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 px-2 py-0.5 rounded-md text-purple-400 transition cursor-none hover:scale-105"
                          >
                            @{s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Display Name + Pronouns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                        className="profile-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block">Pronouns</label>
                      <input
                        type="text"
                        value={pronouns}
                        onChange={e => setPronouns(e.target.value)}
                        placeholder="they/them, he/him..."
                        className="profile-input"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Bio Section ── */}
                <div className="space-y-1.5 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono uppercase tracking-widest font-semibold">
                      <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                      Bio
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span className={`${bio.length > BIO_MAX_LENGTH * 0.9 ? 'text-amber-400' : bio.length >= BIO_MAX_LENGTH ? 'text-rose-400' : 'text-slate-600'} transition-colors`}>
                        {bio.length}/{BIO_MAX_LENGTH}
                      </span>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-600">{bioWordCount} words</span>
                    </div>
                  </div>
                  <textarea
                    ref={bioRef}
                    value={bio}
                    onChange={e => {
                      if (e.target.value.length <= BIO_MAX_LENGTH) setBio(e.target.value);
                    }}
                    placeholder="Describe your stellar observations, interests, and cosmic aspirations..."
                    className="profile-input bio-textarea"
                    rows={3}
                  />
                </div>

                {/* ── Theme Colors ── */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono uppercase tracking-widest font-semibold">
                    <svg className="w-3.5 h-3.5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" /></svg>
                    Theme Colors
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Banner Color */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Banner</label>
                      <div className="flex flex-wrap gap-1.5">
                        {BANNER_PRESETS.map(color => (
                          <button
                            key={color}
                            className={`color-swatch cursor-none ${bannerColor === color ? 'color-swatch-active' : ''}`}
                            style={{ backgroundColor: color, color }}
                            onClick={() => setBannerColor(color)}
                          />
                        ))}
                        <div className="relative">
                          <input
                            type="color"
                            value={bannerColor}
                            onChange={e => setBannerColor(e.target.value)}
                            className="w-7 h-7 rounded-lg bg-transparent border border-dashed border-white/20 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                            title="Custom color"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Accent</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ACCENT_PRESETS.map(color => (
                          <button
                            key={color}
                            className={`color-swatch cursor-none ${accentColor === color ? 'color-swatch-active' : ''}`}
                            style={{ backgroundColor: color, color }}
                            onClick={() => setAccentColor(color)}
                          />
                        ))}
                        <div className="relative">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={e => setAccentColor(e.target.value)}
                            className="w-7 h-7 rounded-lg bg-transparent border border-dashed border-white/20 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                            title="Custom color"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Social Links ── */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono uppercase tracking-widest font-semibold">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.802a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.016" /></svg>
                    Social Links
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* GitHub */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        GitHub
                      </label>
                      <input
                        type="url"
                        value={github}
                        onChange={e => setGithub(e.target.value)}
                        placeholder="https://github.com/username"
                        className="profile-input text-xs"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={e => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="profile-input text-xs"
                      />
                    </div>

                    {/* Website */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-4.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.467.732-3.561" /></svg>
                        Website
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={e => setWebsite(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="profile-input text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Save / Reset Actions ── */}
                <AnimatePresence>
                  {hasUnsavedChanges && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: 10, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-6 p-4 rounded-xl bg-[#030014]/90 border border-amber-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Unsaved changes
                        </div>
                        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                          <button
                            onClick={resetAllFields}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-medium text-slate-400 bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] hover:text-slate-200 hover:border-white/15 transition-all duration-200 cursor-none flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                            </svg>
                            Reset
                          </button>
                          <button
                            onClick={saveAllFields}
                            disabled={savingStatus === 'saving'}
                            className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-200 cursor-none flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {savingStatus === 'saving' ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                  className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                                />
                                Saving...
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </GlassCard>
            </motion.div>
          </motion.div>
        )}

        {/* ──────────── ACHIEVEMENTS TAB ──────────── */}
        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
            className="space-y-8"
          >

            {/* Stats Grid */}
            <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Observations', value: profile?.totalObservations || 23, icon: '🔭', gradient: 'from-purple-600/20 to-indigo-600/10' },
                { label: 'Missions Done', value: completedMissionCount, icon: '✅', gradient: 'from-emerald-600/20 to-teal-600/10' },
                { label: 'Current Streak', value: profile?.currentStreak || 7, icon: '🔥', suffix: 'd', gradient: 'from-orange-600/20 to-amber-600/10' },
                { label: 'Best Streak', value: profile?.longestStreak || 14, icon: '🏆', suffix: 'd', gradient: 'from-yellow-600/20 to-amber-600/10' },
              ].map((stat, idx) => (
                <GlassCard key={idx} className="text-center py-6 relative overflow-hidden group" hover={false}>
                  <div className={`stat-orb-bg bg-gradient-to-br ${stat.gradient}`} style={{ animationDelay: `${idx * 0.5}s` }} />
                  <div className="absolute inset-0 hud-grid opacity-5 pointer-events-none" />
                  <span className="text-3xl block">
                    {stat.icon}
                  </span>
                  <div className="text-2xl font-black text-white mt-2 font-mono">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1.5 font-bold">{stat.label}</div>
                </GlassCard>
              ))}
            </motion.div>

            {/* Badges */}
            <motion.div variants={staggerItem}>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-purple-500/15 flex items-center justify-center text-xs">🎖️</span>
                Badges Collection
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {mockBadges.map((badge, idx) => {
                  const isUnlocked = !!badge.unlockedAt;
                  const colors = BADGE_RARITY_COLORS[badge.rarity];
                  return (
                    <GlassCard
                      key={badge.id}
                      hover={false}
                      className={`text-center py-6 flex flex-col justify-between items-center relative overflow-hidden transition-all duration-300 ${
                        !isUnlocked ? 'opacity-35 grayscale' : ''
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                      <div className="text-4xl mb-3 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] animate-float-slow select-none">
                        {badge.icon}
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{badge.name}</h4>
                      <p className="text-[10px] text-slate-400 font-light text-center px-2 mb-3 leading-relaxed">
                        {badge.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full capitalize"
                          style={{
                            backgroundColor: `${colors.bg}20`,
                            color: colors.text,
                            border: `1px solid ${colors.border}25`,
                          }}
                        >
                          {badge.rarity}
                        </span>
                        {isUnlocked && (
                          <span className="text-[8px] font-mono text-emerald-500">✓ Unlocked</span>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </motion.div>

            {/* Achievements Progress */}
            <motion.div variants={staggerItem} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-cyan-500/15 flex items-center justify-center text-xs">🎯</span>
                Mission Objectives
              </h3>
              <div className="space-y-3">
                {mockAchievements.map((ach, idx) => {
                  const pct = Math.round((ach.progress / ach.maxProgress) * 100);
                  return (
                    <div key={ach.id}>
                      <GlassCard className="relative overflow-hidden p-5" hover={false}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border border-purple-500/25 flex items-center justify-center text-2xl flex-shrink-0">
                            {ach.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-xs font-bold text-white tracking-wide font-mono">{ach.name}</h4>
                              <span className="text-[10px] text-slate-500 font-mono font-bold">{pct}%</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">{ach.description}</p>

                            <div className="w-full h-[4px] bg-slate-950 rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-[9px] text-slate-600 font-mono">{ach.progress}/{ach.maxProgress}</span>
                              <span className="text-[9px] text-amber-400 font-mono font-bold">+{ach.xpReward} XP</span>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </motion.div>
        )}

        {/* ──────────── SETTINGS TAB ──────────── */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >

            {/* Privacy Controls */}
            <motion.div variants={staggerItem} className="lg:col-span-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                Privacy Controls
              </h3>

              <GlassCard className="p-5 space-y-1" hover={false}>
                {[
                  {
                    label: 'Public Profile',
                    desc: 'Allow other explorers to discover your cosmic card.',
                    state: publicProfile,
                    color: 'purple',
                    toggle: () => { const v = !publicProfile; setPublicProfile(v); saveField('privacy.publicProfile', v); },
                  },
                  {
                    label: 'Show Streak',
                    desc: 'Display your observation streaks on your profile.',
                    state: showStreak,
                    color: 'cyan',
                    toggle: () => { const v = !showStreak; setShowStreak(v); saveField('privacy.showStreak', v); },
                  },
                  {
                    label: 'Show XP & Level',
                    desc: 'Share your experience points and level publicly.',
                    state: showXP,
                    color: 'pink',
                    toggle: () => { const v = !showXP; setShowXP(v); saveField('privacy.showXP', v); },
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-transparent hover:border-white/5 transition-all"
                  >
                    <div className="space-y-0.5 max-w-[70%]">
                      <label className="text-xs font-semibold text-slate-200 block">{item.label}</label>
                      <span className="text-[10px] text-slate-500 leading-relaxed block">{item.desc}</span>
                    </div>
                    <button
                      onClick={item.toggle}
                      className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 focus:outline-none cursor-none relative ${
                        item.state ? `bg-${item.color}-600 shadow-[0_0_12px_rgba(124,58,237,0.3)]` : 'bg-slate-800'
                      }`}
                      style={item.state ? {
                        backgroundColor: item.color === 'purple' ? '#7c3aed' : item.color === 'cyan' ? '#0891b2' : '#db2777',
                        boxShadow: `0 0 12px ${item.color === 'purple' ? 'rgba(124,58,237,0.3)' : item.color === 'cyan' ? 'rgba(6,182,212,0.3)' : 'rgba(219,39,119,0.3)'}`,
                      } : {}}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow-md"
                        animate={{ x: item.state ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                ))}
              </GlassCard>
            </motion.div>

            {/* Account Info */}
            <motion.div variants={staggerItem} className="lg:col-span-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                Account Information
              </h3>
              <GlassCard className="p-5 space-y-0" hover={false}>
                {[
                  { label: 'Explorer ID', value: profile?.clerkId, copyable: true },
                  { label: 'Email', value: profile?.email },
                  { label: 'Joined', value: new Date(profile?.joinedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Rank', value: `${rankIcon} ${profile?.rank || 'Stargazer'}` },
                  { label: 'Total XP', value: `${(profile?.xp || 1250).toLocaleString()} XP` },
                  { label: 'Database', value: 'CONNECTED', isStatus: true },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center text-xs font-mono py-2.5 ${
                      idx < 5 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <span className="text-slate-500">{row.label}</span>
                    <div className="flex items-center gap-2">
                      {row.isStatus ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {row.value}
                        </span>
                      ) : (
                        <span className={`text-slate-300 ${row.copyable ? 'select-all' : ''} max-w-[200px] truncate`}>
                          {row.value}
                        </span>
                      )}
                      {row.copyable && (
                        <button
                          onClick={() => navigator.clipboard.writeText(row.value || '')}
                          className="text-slate-600 hover:text-purple-400 transition-colors cursor-none"
                          title="Copy to clipboard"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
