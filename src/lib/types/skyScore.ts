export interface SkyScore {
  overall: number; // 0-100
  rating: SkyRating;
  components: SkyScoreComponents;
  recommendation: string;
  bestViewingTime: string;
  calculatedAt: string;
}

export type SkyRating = 'Excellent' | 'Good' | 'Average' | 'Poor';

export interface SkyScoreComponents {
  cloudCover: { value: number; score: number; weight: number };
  lightPollution: { value: number; score: number; weight: number };
  visiblePlanets: { value: number; score: number; weight: number };
  satelliteActivity: { value: number; score: number; weight: number };
  moonBrightness: { value: number; score: number; weight: number };
  transparency: { value: number; score: number; weight: number };
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'moonrise' | 'moonset' | 'sunset' | 'sunrise' | 'planet' | 'satellite' | 'meteor' | 'iss' | 'starlink' | 'twilight';
  icon: string;
  importance: 'high' | 'medium' | 'low';
  details?: Record<string, string>;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  timezone: string;
}

export interface SavedLocation extends LocationData {
  id: string;
  name: string;
  savedAt: string;
}

export interface Notification {
  id: string;
  type: 'iss_pass' | 'meteor_shower' | 'mission_reminder' | 'planet_visibility' | 'achievement' | 'daily_challenge';
  title: string;
  message: string;
  read: boolean;
  scheduledFor: string;
  createdAt: string;
  actionUrl?: string;
}

export interface SpaceFact {
  id: string;
  fact: string;
  category: 'planet' | 'star' | 'galaxy' | 'universe' | 'exploration' | 'technology';
  source?: string;
}
