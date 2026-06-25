import { NextRequest } from 'next/server';
import { fetchPlanetPositions, fetchMoonPhase, fetchSunData } from '@/lib/services/astronomyService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '40.7128');
  const lng = parseFloat(searchParams.get('lng') || '-74.006');

  try {
    const [planets, moonPhase, sunData] = await Promise.all([
      fetchPlanetPositions(lat, lng),
      fetchMoonPhase(lat, lng),
      fetchSunData(lat, lng),
    ]);

    return Response.json({ planets, moonPhase, sunData });
  } catch (error) {
    console.error('Astronomy API error:', error);
    return Response.json({ error: 'Failed to fetch astronomy data' }, { status: 500 });
  }
}
