export interface CelestialBody {
  id: string;
  name: string;
  type: 'planet' | 'star' | 'moon' | 'asteroid' | 'comet';
  altitude: number; // degrees above horizon
  azimuth: number; // degrees from north
  magnitude: number; // apparent magnitude
  rightAscension: string;
  declination: string;
  constellation: string;
  isVisible: boolean;
  riseTime: string;
  setTime: string;
  transitTime: string;
  distanceAU: number;
  illumination?: number; // percentage for moon/planets
  phase?: string; // moon phase name
}

export interface MoonPhase {
  phase: string;
  illumination: number;
  age: number; // days since new moon
  emoji: string;
  nextFullMoon: string;
  nextNewMoon: string;
  riseTime: string;
  setTime: string;
}

export interface SunData {
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLength: string;
  civilTwilightStart: string;
  civilTwilightEnd: string;
  nauticalTwilightStart: string;
  nauticalTwilightEnd: string;
  astronomicalTwilightStart: string;
  astronomicalTwilightEnd: string;
  goldenHourStart: string;
  goldenHourEnd: string;
}

export interface MeteorShower {
  name: string;
  peakDate: string;
  ratePerHour: number;
  radiantConstellation: string;
  status: 'active' | 'upcoming' | 'past';
  bestViewingTime: string;
  moonInterference: 'none' | 'low' | 'moderate' | 'high';
}

export interface Constellation {
  name: string;
  abbreviation: string;
  stars: ConstellationStar[];
  lines: [number, number][]; // pairs of star indices for line drawing
  isVisible: boolean;
  bestViewingMonth: string;
}

export interface ConstellationStar {
  name: string;
  rightAscension: number;
  declination: number;
  magnitude: number;
}

export interface NearEarthObject {
  id: string;
  name: string;
  estimatedDiameter: { min: number; max: number };
  closeApproachDate: string;
  missDistance: { kilometers: string; lunar: string };
  relativeVelocity: string;
  isPotentiallyHazardous: boolean;
}

export interface APOD {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string;
  mediaType: 'image' | 'video';
  copyright?: string;
}

export interface SolarActivity {
  solarFlareCount: number;
  kpIndex: number;
  solarWindSpeed: number;
  geomagneticStorm: 'quiet' | 'minor' | 'moderate' | 'strong' | 'extreme';
  auroraForecast: string;
}
