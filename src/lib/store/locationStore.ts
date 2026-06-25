import { create } from 'zustand';
import type { LocationData, SavedLocation } from '../types/skyScore';

interface LocationState {
  currentLocation: LocationData | null;
  savedLocations: SavedLocation[];
  isLoading: boolean;
  error: string | null;
  setCurrentLocation: (location: LocationData) => void;
  addSavedLocation: (location: SavedLocation) => void;
  removeSavedLocation: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  requestGeolocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  savedLocations: [],
  isLoading: false,
  error: null,
  setCurrentLocation: (location) => set({ currentLocation: location, error: null }),
  addSavedLocation: (location) =>
    set((state) => ({ savedLocations: [...state.savedLocations, location] })),
  removeSavedLocation: (id) =>
    set((state) => ({
      savedLocations: state.savedLocations.filter((l) => l.id !== id),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  requestGeolocation: async () => {
    set({ isLoading: true, error: null });

    // Step 1: Instantly load IP-based geolocation as a fast initial placeholder
    let initialLocation: LocationData | null = null;
    try {
      const res = await fetch('/api/location');
      if (res.ok) {
        initialLocation = await res.json();
        set({ currentLocation: initialLocation });
      }
    } catch (err) {
      console.error('Error fetching initial IP location:', err);
    }

    // Step 2: Request precise GPS geolocation in the background
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000, // 8 seconds timeout
          maximumAge: 300000,
        });
      });
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch(`/api/location?lat=${latitude}&lng=${longitude}`);
        if (res.ok) {
          const data = await res.json();
          set({ currentLocation: data, isLoading: false });
          return;
        }
      } catch (err) {
        console.error('Error fetching reverse geocode for GPS coords:', err);
      }

      // Fallback to GPS coordinates with placeholder names if API fails
      const location: LocationData = {
        latitude,
        longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        city: initialLocation?.city || 'Current Location',
        region: initialLocation?.region || '',
        country: initialLocation?.country || '',
      };
      set({ currentLocation: location, isLoading: false });
    } catch (error) {
      // Step 3: Browser geolocation denied/timed out, retain IP-based or fall back to default
      if (initialLocation) {
        set({ currentLocation: initialLocation, isLoading: false });
      } else {
        set({
          currentLocation: {
            latitude: 40.7128,
            longitude: -74.006,
            city: 'New York',
            region: 'NY',
            country: 'US',
            timezone: 'America/New_York',
          },
          isLoading: false,
          error: 'Location access denied. Using default location.',
        });
      }
    }
  },
}));
