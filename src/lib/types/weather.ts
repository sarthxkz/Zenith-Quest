  export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number; // percentage
  visibility: number; // km
  pressure: number;
  uvIndex: number;
  description: string;
  icon: string;
  isDay: boolean;
  precipitation: number;
  dewPoint: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  cloudCover: number;
  visibility: number;
  windSpeed: number;
  precipitation: number;
  humidity: number;
}

export interface ObservingConditions {
  cloudCover: number;
  transparency: 'excellent' | 'good' | 'fair' | 'poor';
  seeing: 'excellent' | 'good' | 'fair' | 'poor';
  humidity: number;
  windSpeed: number;
  temperature: number;
  dewPoint: number;
  lightPollution: number; // Bortle scale 1-9
  overallRating: 'excellent' | 'good' | 'average' | 'poor';
}
