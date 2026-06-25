import mongoose, { Schema } from 'mongoose';

const SavedLocationSchema = new Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timezone: { type: String },
  lightPollution: { type: Number, default: 0 },
  isFavorite: { type: Boolean, default: false },
  savedAt: { type: Date, default: Date.now },
});

const ObservationRecordSchema = new Schema({
  target: { type: String, required: true },
  targetType: { type: String },
  locationName: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String },
  skyScore: { type: Number },
  conditions: { type: String },
});

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, index: true },
  displayName: { type: String },
  email: { type: String, required: true },
  avatar: { type: String },
  bio: { type: String, default: '' },
  pronouns: { type: String, default: '' },
  skills: { type: Array, default: [] },
  interests: { type: Array, default: [] },
  bannerColor: { type: String, default: '#7c3aed' },
  accentColor: { type: String, default: '#06b6d4' },
  avatarColor: { type: String, default: '#ec4899' },
  bannerUrl: { type: String, default: '' },
  socialLinks: {
    portfolio: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  privacy: {
    publicProfile: { type: Boolean, default: true },
    showStreak: { type: Boolean, default: true },
    showXP: { type: Boolean, default: true }
  },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  rank: { type: String, default: 'Stargazer' },
  joinedAt: { type: Date, default: Date.now },
  totalObservations: { type: Number, default: 0 },
  completedMissions: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  badges: { type: Array, default: [] },
  achievements: { type: Array, default: [] },
  favoriteLocations: [SavedLocationSchema],
  activeMissions: { type: Array, default: [] },
  observationHistory: [ObservationRecordSchema],
  settings: {
    theme: { type: String, default: 'dark' },
    units: { type: String, default: 'metric' },
    notifications: {
      issPass: { type: Boolean, default: true },
      meteorShower: { type: Boolean, default: true },
      planetVisibility: { type: Boolean, default: true },
      missionReminder: { type: Boolean, default: true },
    }
  }
}, { timestamps: true });

// Check if model exists before compiling to support Next.js Hot Module Replacement (HMR)
export default mongoose.models.User || mongoose.model('User', UserSchema);
