import type { APOD, NearEarthObject, SolarActivity } from '../types/astronomy';
import { mockAPOD, mockNEOs, mockSolarActivity } from '../mock/mockAstronomy';

const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const BASE_URL = 'https://api.nasa.gov';

export async function fetchAPOD(): Promise<APOD> {
  try {
    const res = await fetch(`${BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`NASA APOD API error: ${res.status}`);
    const data = await res.json();
    return {
      title: data.title,
      date: data.date,
      explanation: data.explanation,
      url: data.url,
      hdurl: data.hdurl,
      mediaType: data.media_type === 'video' ? 'video' : 'image',
      copyright: data.copyright,
    };
  } catch (error) {
    console.error('Failed to fetch APOD:', error);
    return mockAPOD;
  }
}

export async function fetchNearEarthObjects(startDate?: string, endDate?: string): Promise<NearEarthObject[]> {
  try {
    const today = startDate || new Date().toISOString().split('T')[0];
    const end = endDate || today;
    const res = await fetch(
      `${BASE_URL}/neo/rest/v1/feed?start_date=${today}&end_date=${end}&api_key=${NASA_API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`NASA NEO API error: ${res.status}`);
    const data = await res.json();

    const neos: NearEarthObject[] = [];
    for (const date of Object.keys(data.near_earth_objects)) {
      for (const neo of data.near_earth_objects[date]) {
        const approach = neo.close_approach_data[0];
        neos.push({
          id: neo.id,
          name: neo.name,
          estimatedDiameter: {
            min: Math.round(neo.estimated_diameter.meters.estimated_diameter_min),
            max: Math.round(neo.estimated_diameter.meters.estimated_diameter_max),
          },
          closeApproachDate: approach?.close_approach_date || date,
          missDistance: {
            kilometers: Math.round(parseFloat(approach?.miss_distance?.kilometers || '0')).toLocaleString(),
            lunar: parseFloat(approach?.miss_distance?.lunar || '0').toFixed(2),
          },
          relativeVelocity: `${parseFloat(approach?.relative_velocity?.kilometers_per_second || '0').toFixed(1)} km/s`,
          isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
        });
      }
    }
    return neos.sort((a, b) => parseFloat(a.missDistance.lunar) - parseFloat(b.missDistance.lunar)).slice(0, 10);
  } catch (error) {
    console.error('Failed to fetch NEOs:', error);
    return mockNEOs;
  }
}

export async function fetchSolarActivity(): Promise<SolarActivity> {
  try {
    // NASA DONKI API for solar flares
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const res = await fetch(
      `${BASE_URL}/DONKI/FLR?startDate=${weekAgo}&endDate=${today}&api_key=${NASA_API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`NASA DONKI API error: ${res.status}`);
    const flares = await res.json();

    return {
      solarFlareCount: Array.isArray(flares) ? flares.length : 0,
      kpIndex: mockSolarActivity.kpIndex,
      solarWindSpeed: mockSolarActivity.solarWindSpeed,
      geomagneticStorm: mockSolarActivity.geomagneticStorm,
      auroraForecast: mockSolarActivity.auroraForecast,
    };
  } catch (error) {
    console.error('Failed to fetch solar activity:', error);
    return mockSolarActivity;
  }
}
