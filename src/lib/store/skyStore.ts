import { create } from 'zustand';
import type { SkyScore } from '../types/skyScore';
import type { CelestialBody, MoonPhase } from '../types/astronomy';
import type { WeatherData } from '../types/weather';

interface SkyState {
  skyScore: SkyScore | null;
  planets: CelestialBody[];
  moonPhase: MoonPhase | null;
  weather: WeatherData | null;
  aiSummary: string | null;
  isLoading: boolean;
  setSkyScore: (score: SkyScore) => void;
  setPlanets: (planets: CelestialBody[]) => void;
  setMoonPhase: (moon: MoonPhase) => void;
  setWeather: (weather: WeatherData) => void;
  setAiSummary: (summary: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useSkyStore = create<SkyState>((set) => ({
  skyScore: null,
  planets: [],
  moonPhase: null,
  weather: null,
  aiSummary: null,
  isLoading: false,
  setSkyScore: (skyScore) => set({ skyScore }),
  setPlanets: (planets) => set({ planets }),
  setMoonPhase: (moonPhase) => set({ moonPhase }),
  setWeather: (weather) => set({ weather }),
  setAiSummary: (aiSummary) => set({ aiSummary }),
  setLoading: (isLoading) => set({ isLoading }),
}));
