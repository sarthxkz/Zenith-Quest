export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'observation' | 'identification' | 'tracking' | 'photography' | 'exploration';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  xpReward: number;
  target: string;
  targetType: 'planet' | 'satellite' | 'constellation' | 'moon' | 'meteor' | 'star' | 'deepsky';
  requirements: string[];
  status: 'available' | 'active' | 'completed' | 'expired';
  progress: number; // 0-100
  completedAt?: string;
  expiresAt?: string;
  icon: string;
  badge?: Badge;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  category: 'observation' | 'tracking' | 'exploration' | 'social' | 'streak' | 'special';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  badge: Badge;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: 'observation' | 'quiz' | 'identification';
  isCompleted: boolean;
  expiresAt: string;
}
