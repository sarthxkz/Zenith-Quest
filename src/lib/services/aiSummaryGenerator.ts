import type { CelestialBody, MoonPhase } from '../types/astronomy';
import type { WeatherData } from '../types/weather';
import type { SatellitePass } from '../types/satellite';
import type { SkyScore } from '../types/skyScore';

export function generateAISummary(
  weather: WeatherData,
  moonPhase: MoonPhase,
  planets: CelestialBody[],
  satellitePasses: SatellitePass[],
  skyScore: SkyScore
): string {
  const parts: string[] = [];

  // Opening based on sky score
  if (skyScore.overall >= 80) {
    parts.push('Tonight presents exceptional stargazing conditions!');
  } else if (skyScore.overall >= 60) {
    parts.push('Good conditions for stargazing tonight.');
  } else if (skyScore.overall >= 40) {
    parts.push('Moderate conditions tonight — focus on bright objects.');
  } else {
    parts.push('Challenging conditions tonight, but bright objects may still be visible.');
  }

  // Weather context
  if (weather.cloudCover < 20) {
    parts.push('Skies are beautifully clear with excellent visibility.');
  } else if (weather.cloudCover < 50) {
    parts.push(`Partly cloudy skies with ${weather.cloudCover}% cloud cover.`);
  } else {
    parts.push(`Cloud cover is at ${weather.cloudCover}%, which may limit visibility.`);
  }

  // Visible planets
  const visiblePlanets = planets.filter((p) => p.isVisible);
  if (visiblePlanets.length > 0) {
    const brightestPlanet = visiblePlanets.reduce((a, b) => (a.magnitude < b.magnitude ? a : b));
    if (visiblePlanets.length === 1) {
      parts.push(`${brightestPlanet.name} is visible in the ${getDirection(brightestPlanet.azimuth)} sky at ${brightestPlanet.altitude.toFixed(0)}° altitude.`);
    } else {
      const planetNames = visiblePlanets.map((p) => p.name);
      const lastPlanet = planetNames.pop();
      parts.push(`${planetNames.join(', ')} and ${lastPlanet} are all visible tonight.`);
      parts.push(`${brightestPlanet.name} is the brightest at magnitude ${brightestPlanet.magnitude.toFixed(1)}, shining in the ${getDirection(brightestPlanet.azimuth)} sky.`);
    }
  }

  // Moon
  if (moonPhase.illumination > 0) {
    parts.push(`The ${moonPhase.phase} Moon is ${moonPhase.illumination}% illuminated.`);
  }

  // Satellite passes
  const issPasses = satellitePasses.filter((p) => p.satellite.includes('ISS'));
  if (issPasses.length > 0) {
    const nextPass = issPasses[0];
    const passTime = new Date(nextPass.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    parts.push(`The ISS will pass overhead at ${passTime}, reaching ${nextPass.maxElevation}° elevation — ${nextPass.maxElevation > 45 ? 'an excellent pass!' : 'look towards the ' + nextPass.startAzimuthCompass + ' sky.'}`);
  }

  // Recommendation
  parts.push(skyScore.recommendation);

  return parts.join(' ');
}

// OpenAI-powered summary (when API key available)
export async function generateAISummaryWithOpenAI(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Zenith, a friendly and knowledgeable AI sky guide. Generate a concise, engaging 2-3 sentence summary of tonight\'s sky conditions. Be enthusiastic but informative. Include specific viewing recommendations.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI summary error:', error);
    return null;
  }
}

function getDirection(azimuth: number): string {
  if (azimuth >= 337.5 || azimuth < 22.5) return 'northern';
  if (azimuth >= 22.5 && azimuth < 67.5) return 'northeastern';
  if (azimuth >= 67.5 && azimuth < 112.5) return 'eastern';
  if (azimuth >= 112.5 && azimuth < 157.5) return 'southeastern';
  if (azimuth >= 157.5 && azimuth < 202.5) return 'southern';
  if (azimuth >= 202.5 && azimuth < 247.5) return 'southwestern';
  if (azimuth >= 247.5 && azimuth < 292.5) return 'western';
  return 'northwestern';
}
