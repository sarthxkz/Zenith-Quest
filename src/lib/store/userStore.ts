import { create } from 'zustand';
import type { UserProfile, ExplorerRank } from '../types/user';
import type { Badge } from '../types/mission';
import { RANK_THRESHOLDS } from '../types/user';

interface UserState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  setProfile: (profile: UserProfile) => void;
  addXP: (amount: number) => void;
  addBadge: (badge: Badge) => void;
  setGuestMode: (guest: boolean) => void;
  setAuthenticated: (auth: boolean) => void;
}

function getRankForXP(xp: number): ExplorerRank {
  const ranks = Object.entries(RANK_THRESHOLDS).reverse();
  for (const [rank, threshold] of ranks) {
    if (xp >= threshold) return rank as ExplorerRank;
  }
  return 'Stargazer';
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isAuthenticated: false,
  isGuestMode: false,
  setProfile: (profile) => set({ profile }),
  addXP: (amount) =>
    set((state) => {
      if (!state.profile) return state;
      const newXP = state.profile.xp + amount;
      const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
      return {
        profile: {
          ...state.profile,
          xp: newXP,
          level: newLevel,
          rank: getRankForXP(newXP),
        },
      };
    }),
  addBadge: (badge) =>
    set((state) => {
      if (!state.profile) return state;
      return {
        profile: {
          ...state.profile,
          badges: [...state.profile.badges, badge],
        },
      };
    }),
  setGuestMode: (isGuestMode) => set({ isGuestMode }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));
