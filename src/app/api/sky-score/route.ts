import { NextRequest } from 'next/server';
import { fetchWeather } from '@/lib/services/weatherService';
import { fetchPlanetPositions, fetchMoonPhase, fetchSunData } from '@/lib/services/astronomyService';
import { fetchSatellitesAbove, fetchVisualPasses } from '@/lib/services/satelliteService';
import { calculateSkyScore } from '@/lib/services/skyScoreEngine';
import { mockMoonPhase } from '@/lib/mock/mockAstronomy';
import { NOTABLE_SATELLITES } from '@/lib/types/satellite';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '40.7128');
  const lng = parseFloat(searchParams.get('lng') || '-74.006');

  try {
    const [weather, planets, moonPhase, satellites, issPasses] = await Promise.all([
      fetchWeather(lat, lng),
      fetchPlanetPositions(lat, lng),
      fetchMoonPhase(lat, lng),
      fetchSatellitesAbove(lat, lng),
      fetchVisualPasses(NOTABLE_SATELLITES.ISS, lat, lng),
    ]);

    const skyScore = calculateSkyScore(weather, moonPhase || mockMoonPhase, planets, satellites.length);

    return Response.json({
      skyScore,
      weather,
      planets,
      moonPhase: moonPhase || mockMoonPhase,
      satelliteCount: satellites.length,
      issPasses: issPasses || [],
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sky score API error:', error);
    return Response.json({ error: 'Failed to calculate sky score' }, { status: 500 });
  }
}
