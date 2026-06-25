import { NextRequest } from 'next/server';
import { fetchPlanetPositions, fetchMoonPhase, fetchSunData } from '@/lib/services/astronomyService';
import { fetchVisualPasses } from '@/lib/services/satelliteService';
import { generateTimeline } from '@/lib/services/timelineGenerator';
import { mockMoonPhase, mockSunData } from '@/lib/mock/mockAstronomy';
import { NOTABLE_SATELLITES } from '@/lib/types/satellite';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '40.7128');
  const lng = parseFloat(searchParams.get('lng') || '-74.006');

  try {
    const [planets, sunData, issPasses] = await Promise.all([
      fetchPlanetPositions(lat, lng),
      fetchSunData(lat, lng),
      fetchVisualPasses(NOTABLE_SATELLITES.ISS, lat, lng),
    ]);

    const timeline = generateTimeline(
      sunData || mockSunData,
      mockMoonPhase,
      planets,
      issPasses
    );

    return Response.json({ timeline });
  } catch (error) {
    console.error('Timeline API error:', error);
    return Response.json({ error: 'Failed to generate timeline' }, { status: 500 });
  }
}
