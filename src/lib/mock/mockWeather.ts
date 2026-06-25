import type { WeatherData, ObservingConditions } from '../types/weather';

export const mockWeather: WeatherData = {
  temperature: 8,
  feelsLike: 5,
  humidity: 45,
  windSpeed: 12,
  windDirection: 225,
  cloudCover: 15,
  visibility: 16,
  pressure: 1018,
  uvIndex: 0,
  description: 'Clear sky',
  icon: '🌙',
  isDay: false,
  precipitation: 0,
  dewPoint: -2,
};

export const mockObservingConditions: ObservingConditions = {
  cloudCover: 15,
  transparency: 'good',
  seeing: 'good',
  humidity: 45,
  windSpeed: 12,
  temperature: 8,
  dewPoint: -2,
  lightPollution: 4, // Bortle scale
  overallRating: 'good',
};
