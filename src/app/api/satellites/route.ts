import { NextRequest } from 'next/server';
import { fetchSatellitesAbove, fetchVisualPasses, fetchISSPosition } from '@/lib/services/satelliteService';
import { NOTABLE_SATELLITES, SatelliteCategory } from '@/lib/types/satellite';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '40.7128');
  const lng = parseFloat(searchParams.get('lng') || '-74.006');
  const type = searchParams.get('type') || 'all';

  try {
    if (type === 'iss') {
      const [position, passes] = await Promise.all([
        fetchISSPosition(),
        fetchVisualPasses(NOTABLE_SATELLITES.ISS, lat, lng),
      ]);
      return Response.json({ position, passes });
    }

    const category = type === 'starlink' ? SatelliteCategory.STARLINK : SatelliteCategory.VISIBLE;
    const [satellites, issPasses] = await Promise.all([
      fetchSatellitesAbove(lat, lng, 0, 70, category),
      fetchVisualPasses(NOTABLE_SATELLITES.ISS, lat, lng),
    ]);

    return Response.json({ satellites, issPasses });
  } catch (error) {
    console.error('Satellites API error:', error);
    return Response.json({ error: 'Failed to fetch satellite data' }, { status: 500 });
  }
}
