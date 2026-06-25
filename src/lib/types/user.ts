import type { Badge, Achievement, Mission } from './mission';

export interface UserProfile {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  avatar: string;
  xp: number;
  level: number;
  rank: ExplorerRank;
  joinedAt: string;
  totalObservations: number;
  completedMissions: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  achievements: Achievement[];
  favoriteLocations: SavedLocation[];
  activeMissions: Mission[];
  observationHistory: ObservationRecord[];
  settings: UserSettings;
}

export type ExplorerRank =
  | 'Stargazer'
  | 'Night Watcher'
  | 'Sky Navigator'
  | 'Celestial Explorer'
  | 'Cosmos Pioneer'
  | 'Galaxy Master'
  | 'Universe Sage';

export const RANK_THRESHOLDS: Record<ExplorerRank, number> = {
  'Stargazer': 0,
  'Night Watcher': 500,
  'Sky Navigator': 1500,
  'Celestial Explorer': 3500,
  'Cosmos Pioneer': 7000,
  'Galaxy Master': 15000,
  'Universe Sage': 30000,
};

export interface SavedLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  lightPollution: number;
  isFavorite: boolean;
  savedAt: string;
}

export interface ObservationRecord {
  id: string;
  target: string;
  targetType: string;
  locationName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  notes: string;
  skyScore: number;
  conditions: string;
}

export interface UserSettings {
  theme: 'dark' | 'auto';
  units: 'metric' | 'imperial';
  notifications: {
    issPass: boolean;
    meteorShower: boolean;
    planetVisibility: boolean;
    missionReminder: boolean;
  };
  defaultLocation?: SavedLocation;
}
