import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  // If no lat/lng provided, try to geolocate via IP address
  if (!lat || !lng) {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        return Response.json({
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || 'Unknown Location',
          region: data.region || '',
          country: data.country_name || '',
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      }
    } catch (error) {
      console.error('IP geolocation error:', error);
    }
    
    // Default fallback if IP geolocation fails
    return Response.json({
      latitude: 40.7128,
      longitude: -74.006,
      city: 'New York',
      region: 'NY',
      country: 'US',
      timezone: 'America/New_York',
    });
  }

  // Reverse geocode using OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
      {
        headers: {
          'User-Agent': 'ZenithQuest/1.0',
        },
      }
    );
    const data = await res.json();
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.suburb || 'Unknown Location';
    const region = address.state || address.region || '';
    const country = address.country || '';
    
    return Response.json({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      city,
      region,
      country,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    // Fallback: fetch city name by IP since Nominatim failed
    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        return Response.json({
          latitude: ipData.latitude || parseFloat(lat),
          longitude: ipData.longitude || parseFloat(lng),
          city: ipData.city || 'Current Location',
          region: ipData.region || '',
          country: ipData.country_name || '',
          timezone: ipData.timezone || 'UTC',
        });
      }
    } catch (ipErr) {
      console.error('IP geocoding fallback error:', ipErr);
    }

    return Response.json({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      city: 'Current Location',
      region: '',
      country: '',
      timezone: 'UTC',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return Response.json({ error: 'Search query required' }, { status: 400 });
    }

    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`
    );
    const data = await res.json();

    const results = (data.results || []).map((r: Record<string, unknown>) => ({
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      timezone: r.timezone,
    }));

    return Response.json({ results });
  } catch (error) {
    console.error('Location search error:', error);
    return Response.json({ error: 'Failed to search location' }, { status: 500 });
  }
}
