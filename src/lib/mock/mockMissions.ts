import type { Mission, Badge, Achievement, DailyChallenge } from '../types/mission';

export const mockMissions: Mission[] = [
  {
    id: 'm1', title: 'Observe Jupiter', description: 'Find and observe Jupiter in the eastern sky tonight. Jupiter is the brightest object in the sky after the Moon.',
    type: 'observation', difficulty: 'beginner', xpReward: 100, target: 'Jupiter', targetType: 'planet',
    requirements: ['Clear sky visibility', 'Jupiter above horizon'], status: 'available', progress: 0,
    icon: '♃',
  },
  {
    id: 'm2', title: 'Track ISS Pass', description: 'Watch the International Space Station pass overhead. It appears as a bright, fast-moving dot across the sky.',
    type: 'tracking', difficulty: 'beginner', xpReward: 150, target: 'ISS', targetType: 'satellite',
    requirements: ['ISS pass scheduled', 'Clear sky'], status: 'active', progress: 50,
    icon: '🚀',
  },
  {
    id: 'm3', title: 'Identify Orion', description: 'Locate the constellation Orion and identify its three belt stars: Alnitak, Alnilam, and Mintaka.',
    type: 'identification', difficulty: 'beginner', xpReward: 120, target: 'Orion', targetType: 'constellation',
    requirements: ['Orion visible in sky', 'Dark sky conditions'], status: 'available', progress: 0,
    icon: '⭐',
  },
  {
    id: 'm4', title: 'Track Starlink Train', description: 'Observe a train of Starlink satellites passing overhead. They appear as a line of bright dots moving across the sky.',
    type: 'tracking', difficulty: 'intermediate', xpReward: 200, target: 'Starlink', targetType: 'satellite',
    requirements: ['Starlink pass scheduled', 'Clear sky', 'Dark conditions'], status: 'available', progress: 0,
    icon: '🛰️',
  },
  {
    id: 'm5', title: 'Moon Phase Observer', description: 'Document the current moon phase and note its position in the sky relative to nearby constellations.',
    type: 'observation', difficulty: 'beginner', xpReward: 80, target: 'Moon', targetType: 'moon',
    requirements: ['Moon above horizon'], status: 'completed', progress: 100, completedAt: '2024-01-14T20:30:00Z',
    icon: '🌙',
  },
  {
    id: 'm6', title: 'Saturn Ring Viewer', description: 'Use binoculars or a telescope to observe Saturn and its magnificent ring system.',
    type: 'observation', difficulty: 'intermediate', xpReward: 250, target: 'Saturn', targetType: 'planet',
    requirements: ['Saturn visible', 'Binoculars or telescope', 'Good seeing conditions'], status: 'available', progress: 0,
    icon: '♄',
  },
  {
    id: 'm7', title: 'Deep Sky Explorer', description: 'Locate and observe the Orion Nebula (M42), one of the brightest nebulae visible to the naked eye.',
    type: 'exploration', difficulty: 'advanced', xpReward: 350, target: 'Orion Nebula', targetType: 'deepsky',
    requirements: ['Orion visible', 'Dark sky (Bortle 5 or lower)', 'Clear conditions'], status: 'available', progress: 0,
    icon: '🔭',
  },
];

export const mockBadges: Badge[] = [
  { id: 'b1', name: 'First Light', description: 'Complete your first observation', icon: '🌟', rarity: 'common', unlockedAt: '2024-01-10T20:00:00Z', category: 'observation' },
  { id: 'b2', name: 'Planet Hunter', description: 'Observe all 5 visible planets', icon: '🪐', rarity: 'rare', category: 'observation' },
  { id: 'b3', name: 'ISS Spotter', description: 'Successfully track an ISS pass', icon: '🚀', rarity: 'uncommon', unlockedAt: '2024-01-12T19:55:00Z', category: 'tracking' },
  { id: 'b4', name: 'Star Navigator', description: 'Identify 10 constellations', icon: '⭐', rarity: 'rare', category: 'exploration' },
  { id: 'b5', name: 'Night Owl', description: 'Complete 5 observations after midnight', icon: '🦉', rarity: 'uncommon', category: 'streak' },
  { id: 'b6', name: 'Meteor Master', description: 'Observe a meteor shower at peak', icon: '☄️', rarity: 'epic', category: 'observation' },
  { id: 'b7', name: 'Perfect Sky', description: 'Observe on a night with Sky Score 95+', icon: '💎', rarity: 'legendary', category: 'special' },
  { id: 'b8', name: 'Week Warrior', description: '7-day observation streak', icon: '🔥', rarity: 'uncommon', unlockedAt: '2024-01-14T21:00:00Z', category: 'streak' },
];

export const mockAchievements: Achievement[] = [
  { id: 'a1', name: 'Stargazer Initiate', description: 'Complete 5 observations', icon: '🔭', progress: 3, maxProgress: 5, isUnlocked: false, xpReward: 200, badge: mockBadges[0] },
  { id: 'a2', name: 'Solar System Tour', description: 'Observe all 5 visible planets', icon: '🪐', progress: 2, maxProgress: 5, isUnlocked: false, xpReward: 500, badge: mockBadges[1] },
  { id: 'a3', name: 'Space Station Tracker', description: 'Track the ISS 3 times', icon: '🚀', progress: 1, maxProgress: 3, isUnlocked: false, xpReward: 300, badge: mockBadges[2] },
  { id: 'a4', name: 'Constellation Master', description: 'Identify 10 constellations', icon: '⭐', progress: 4, maxProgress: 10, isUnlocked: false, xpReward: 750, badge: mockBadges[3] },
  { id: 'a5', name: 'Dedication', description: 'Maintain a 30-day streak', icon: '🔥', progress: 7, maxProgress: 30, isUnlocked: false, xpReward: 1000, badge: mockBadges[7] },
];

export const mockDailyChallenge: DailyChallenge = {
  id: 'dc1',
  title: 'Spot the Red Planet',
  description: 'Mars is visible tonight in Taurus. Can you find it? Look for a reddish-orange "star" near the Pleiades cluster.',
  xpReward: 75,
  type: 'observation',
  isCompleted: false,
  expiresAt: '2024-01-16T00:00:00Z',
};
