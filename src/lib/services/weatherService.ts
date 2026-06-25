import type { WeatherData } from '../types/weather';
import { mockWeather } from '../mock/mockWeather';

const BASE_URL = 'https://api.open-meteo.com/v1';

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  try {
    const res = await fetch(
      `${BASE_URL}/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,cloud_cover,wind_speed_10m,wind_direction_10m,surface_pressure,is_day,uv_index,visibility,dew_point_2m&timezone=auto`,
      { next: { revalidate: 900 } } // 15 min cache
    );
    if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
    const data = await res.json();
    const c = data.current;

    return {
      temperature: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      windSpeed: Math.round(c.wind_speed_10m),
      windDirection: c.wind_direction_10m,
      cloudCover: c.cloud_cover,
      visibility: Math.round((c.visibility || 16000) / 1000),
      pressure: Math.round(c.surface_pressure),
      uvIndex: c.uv_index || 0,
      description: getWeatherDescription(c.cloud_cover, c.precipitation, c.is_day),
      icon: getWeatherIcon(c.cloud_cover, c.precipitation, c.is_day),
      isDay: c.is_day === 1,
      precipitation: c.precipitation,
      dewPoint: Math.round(c.dew_point_2m || 0),
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return mockWeather;
  }
}

function getWeatherDescription(cloudCover: number, precipitation: number, isDay: number): string {
  if (precipitation > 5) return 'Heavy rain';
  if (precipitation > 0.5) return 'Light rain';
  if (cloudCover > 80) return 'Overcast';
  if (cloudCover > 50) return 'Mostly cloudy';
  if (cloudCover > 20) return 'Partly cloudy';
  return isDay ? 'Clear sky' : 'Clear night';
}

function getWeatherIcon(cloudCover: number, precipitation: number, isDay: number): string {
  if (precipitation > 0.5) return '🌧️';
  if (cloudCover > 80) return '☁️';
  if (cloudCover > 50) return isDay ? '⛅' : '☁️';
  if (cloudCover > 20) return isDay ? '🌤️' : '🌙';
  return isDay ? '☀️' : '🌙';
}

export async function fetchHourlyForecast(lat: number, lng: number) {
  try {
    const res = await fetch(
      `${BASE_URL}/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,cloud_cover,visibility,wind_speed_10m,precipitation,relative_humidity_2m&timezone=auto&forecast_hours=24`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
    const data = await res.json();
    const h = data.hourly;

    return h.time.map((time: string, i: number) => ({
      time,
      temperature: Math.round(h.temperature_2m[i]),
      cloudCover: h.cloud_cover[i],
      visibility: Math.round((h.visibility?.[i] || 16000) / 1000),
      windSpeed: Math.round(h.wind_speed_10m[i]),
      precipitation: h.precipitation[i],
      humidity: h.relative_humidity_2m[i],
    }));
  } catch (error) {
    console.error('Failed to fetch hourly forecast:', error);
    return [];
  }
}
