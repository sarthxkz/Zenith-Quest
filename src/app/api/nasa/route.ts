import { NextRequest } from 'next/server';
import { fetchAPOD, fetchNearEarthObjects, fetchSolarActivity } from '@/lib/services/nasaService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'apod';

  try {
    switch (type) {
      case 'apod': {
        const apod = await fetchAPOD();
        return Response.json(apod);
      }
      case 'neo': {
        const neos = await fetchNearEarthObjects();
        return Response.json({ neos });
      }
      case 'solar': {
        const solar = await fetchSolarActivity();
        return Response.json(solar);
      }
      default:
        return Response.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('NASA API route error:', error);
    return Response.json({ error: 'Failed to fetch NASA data' }, { status: 500 });
  }
}
