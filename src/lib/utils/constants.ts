import type { SpaceFact } from '../types/skyScore';
import type { Constellation } from '../types/astronomy';

export const SPACE_FACTS: SpaceFact[] = [
  { id: '1', fact: 'A day on Venus is longer than its year. Venus takes 243 Earth days to rotate once but only 225 Earth days to orbit the Sun.', category: 'planet' },
  { id: '2', fact: 'Neutron stars are so dense that a teaspoon of their material would weigh about 6 billion tons.', category: 'star' },
  { id: '3', fact: 'The Milky Way galaxy is on a collision course with the Andromeda Galaxy, expected to merge in about 4.5 billion years.', category: 'galaxy' },
  { id: '4', fact: 'The ISS orbits Earth at about 28,000 km/h, completing one full orbit every 90 minutes.', category: 'exploration' },
  { id: '5', fact: 'Saturn\'s rings are mostly made of ice particles, with some rocky debris and dust. They span up to 282,000 km but are only about 10 meters thick.', category: 'planet' },
  { id: '6', fact: 'The observable universe contains an estimated 2 trillion galaxies.', category: 'universe' },
  { id: '7', fact: 'Olympus Mons on Mars is the largest volcano in the solar system, standing nearly 22 km tall — about 2.5 times the height of Mount Everest.', category: 'planet' },
  { id: '8', fact: 'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.', category: 'star' },
  { id: '9', fact: 'The Hubble Space Telescope has made more than 1.5 million observations since its launch in 1990.', category: 'technology' },
  { id: '10', fact: 'Jupiter\'s Great Red Spot is a storm that has been raging for at least 350 years and is larger than Earth.', category: 'planet' },
  { id: '11', fact: 'There are more stars in the universe than grains of sand on all of Earth\'s beaches.', category: 'universe' },
  { id: '12', fact: 'The footprints left by Apollo astronauts on the Moon will remain for at least 100 million years since there is no wind to erode them.', category: 'exploration' },
  { id: '13', fact: 'Proxima Centauri, the closest star to our Sun, is about 4.24 light-years away.', category: 'star' },
  { id: '14', fact: 'SpaceX\'s Starlink constellation aims to deploy over 12,000 satellites to provide global internet coverage.', category: 'technology' },
  { id: '15', fact: 'The cosmic microwave background radiation is the afterglow of the Big Bang, and it fills the entire universe at a temperature of about 2.7 Kelvin.', category: 'universe' },
];

export const PLANET_COLORS: Record<string, string> = {
  Mercury: '#b5b5b5',
  Venus: '#e8cda0',
  Mars: '#c1440e',
  Jupiter: '#c88b3a',
  Saturn: '#ead6b8',
  Uranus: '#4FD0E7',
  Neptune: '#4b70dd',
};

export const PLANET_ICONS: Record<string, string> = {
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '⛢',
  Neptune: '♆',
};

export const MOON_PHASE_EMOJIS: Record<string, string> = {
  'New Moon': '🌑',
  'Waxing Crescent': '🌒',
  'First Quarter': '🌓',
  'Waxing Gibbous': '🌔',
  'Full Moon': '🌕',
  'Waning Gibbous': '🌖',
  'Last Quarter': '🌗',
  'Waning Crescent': '🌘',
};

export const SKY_RATING_COLORS = {
  Excellent: { primary: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
  Good: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  Average: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  Poor: { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
};

export const EXPLORER_RANK_ICONS: Record<string, string> = {
  'Stargazer': '⭐',
  'Night Watcher': '🌙',
  'Sky Navigator': '🧭',
  'Celestial Explorer': '🔭',
  'Cosmos Pioneer': '🚀',
  'Galaxy Master': '🌌',
  'Universe Sage': '✨',
};

export const MAJOR_CONSTELLATIONS: Partial<Constellation>[] = [
  { name: 'Orion', abbreviation: 'Ori', isVisible: true, bestViewingMonth: 'January' },
  { name: 'Ursa Major', abbreviation: 'UMa', isVisible: true, bestViewingMonth: 'April' },
  { name: 'Ursa Minor', abbreviation: 'UMi', isVisible: true, bestViewingMonth: 'June' },
  { name: 'Cassiopeia', abbreviation: 'Cas', isVisible: true, bestViewingMonth: 'November' },
  { name: 'Leo', abbreviation: 'Leo', isVisible: true, bestViewingMonth: 'April' },
  { name: 'Scorpius', abbreviation: 'Sco', isVisible: true, bestViewingMonth: 'July' },
  { name: 'Cygnus', abbreviation: 'Cyg', isVisible: true, bestViewingMonth: 'September' },
  { name: 'Gemini', abbreviation: 'Gem', isVisible: true, bestViewingMonth: 'February' },
];

export const TIMELINE_ICONS: Record<string, string> = {
  moonrise: '🌕',
  moonset: '🌑',
  sunset: '🌅',
  sunrise: '🌄',
  planet: '🪐',
  satellite: '🛰️',
  meteor: '☄️',
  iss: '🚀',
  starlink: '⭐',
  twilight: '🌆',
};

export const BADGE_RARITY_COLORS = {
  common: { bg: '#6b7280', border: '#9ca3af', text: '#d1d5db' },
  uncommon: { bg: '#16a34a', border: '#22c55e', text: '#86efac' },
  rare: { bg: '#2563eb', border: '#3b82f6', text: '#93c5fd' },
  epic: { bg: '#7c3aed', border: '#8b5cf6', text: '#c4b5fd' },
  legendary: { bg: '#d97706', border: '#f59e0b', text: '#fcd34d' },
};

export const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/satellites', label: 'Satellites', icon: 'satellite' },
  { href: '/sky-dome', label: 'Sky Dome', icon: 'globe' },
  { href: '/missions', label: 'Missions', icon: 'target' },
  { href: '/timeline', label: 'Timeline', icon: 'clock' },
  { href: '/analytics', label: 'Analytics', icon: 'chart' },
  { href: '/profile', label: 'Profile', icon: 'user' },
];
