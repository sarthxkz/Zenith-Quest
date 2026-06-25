import { create } from 'zustand';
import type { Mission } from '../types/mission';

interface MissionState {
  missions: Mission[];
  activeMission: Mission | null;
  setMissions: (missions: Mission[]) => void;
  setActiveMission: (mission: Mission | null) => void;
  startMission: (id: string) => void;
  completeMission: (id: string) => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  missions: [],
  activeMission: null,
  setMissions: (missions) => set({ missions }),
  setActiveMission: (activeMission) => set({ activeMission }),
  startMission: (id) =>
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === id ? { ...m, status: 'active' as const, progress: 0 } : m
      ),
    })),
  completeMission: (id) =>
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === id
          ? { ...m, status: 'completed' as const, progress: 100, completedAt: new Date().toISOString() }
          : m
      ),
    })),
}));
