import type { SkyScore, SkyScoreComponents, SkyRating } from '../types/skyScore';
import type { WeatherData } from '../types/weather';
import type { CelestialBody, MoonPhase } from '../types/astronomy';

export function calculateSkyScore(
  weather: WeatherData,
  moonPhase: MoonPhase,
  planets: CelestialBody[],
  satelliteCount: number,
  lightPollution: number = 5 // Bortle 1-9
): SkyScore {
  const components = calculateComponents(weather, moonPhase, planets, satelliteCount, lightPollution);

  const overall = Math.round(
    components.cloudCover.score * components.cloudCover.weight +
    components.lightPollution.score * components.lightPollution.weight +
    components.visiblePlanets.score * components.visiblePlanets.weight +
    components.satelliteActivity.score * components.satelliteActivity.weight +
    components.moonBrightness.score * components.moonBrightness.weight +
    components.transparency.score * components.transparency.weight
  );

  const rating = getScoreRating(overall);
  const recommendation = getRecommendation(overall, components);
  const bestViewingTime = getBestViewingTime(weather);

  return {
    overall,
    rating,
    components,
    recommendation,
    bestViewingTime,
    calculatedAt: new Date().toISOString(),
  };
}

function calculateComponents(
  weather: WeatherData,
  moonPhase: MoonPhase,
  planets: CelestialBody[],
  satelliteCount: number,
  lightPollution: number
): SkyScoreComponents {
  // Cloud Cover (weight: 30%) - lower is better
  const cloudScore = Math.max(0, 100 - weather.cloudCover);

  // Light Pollution (weight: 25%) - lower Bortle is better
  const lightScore = Math.max(0, Math.round(((9 - lightPollution) / 8) * 100));

  // Visible Planets (weight: 15%) - more is better
  const visiblePlanets = planets.filter((p) => p.isVisible).length;
  const planetScore = Math.min(100, visiblePlanets * 20);

  // Satellite Activity (weight: 10%) - some is good
  const satScore = Math.min(100, satelliteCount * 15);

  // Moon Brightness (weight: 10%) - for deep sky, less is better; for general, moderate is good
  const moonScore = moonPhase.illumination < 30 ? 90 : moonPhase.illumination < 60 ? 70 : moonPhase.illumination < 80 ? 50 : 30;

  // Transparency/Visibility (weight: 10%) - higher visibility is better
  const transScore = Math.min(100, Math.round((weather.visibility / 20) * 100));

  return {
    cloudCover: { value: weather.cloudCover, score: cloudScore, weight: 0.30 },
    lightPollution: { value: lightPollution, score: lightScore, weight: 0.25 },
    visiblePlanets: { value: visiblePlanets, score: planetScore, weight: 0.15 },
    satelliteActivity: { value: satelliteCount, score: satScore, weight: 0.10 },
    moonBrightness: { value: moonPhase.illumination, score: moonScore, weight: 0.10 },
    transparency: { value: weather.visibility, score: transScore, weight: 0.10 },
  };
}

function getScoreRating(score: number): SkyRating {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Poor';
}

function getRecommendation(score: number, components: SkyScoreComponents): string {
  if (score >= 80) return 'Perfect conditions for stargazing! Head outside and enjoy the celestial show.';
  if (score >= 60) {
    if (components.cloudCover.value > 40) return 'Good conditions overall, but watch for increasing cloud cover.';
    return 'Good night for stargazing. Bright planets and satellites should be easily visible.';
  }
  if (score >= 40) {
    if (components.cloudCover.value > 60) return 'Partly cloudy — try observing bright objects like the Moon and planets.';
    if (components.lightPollution.value > 6) return 'Light pollution is high. Focus on bright objects or travel to a darker location.';
    return 'Average conditions. Best for observing bright objects like planets and the Moon.';
  }
  return 'Poor conditions for stargazing. Consider trying another night or finding a darker location.';
}

function getBestViewingTime(weather: WeatherData): string {
  if (weather.isDay) return 'Wait for sunset — best viewing after astronomical twilight.';
  if (weather.cloudCover < 20) return 'Right now! Conditions are excellent.';
  return 'Check hourly forecast for the clearest window tonight.';
}
