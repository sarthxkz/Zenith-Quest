import type { CelestialBody, MoonPhase, SunData } from '../types/astronomy';
import { mockPlanets, mockMoonPhase, mockSunData } from '../mock/mockAstronomy';

const API_ID = process.env.ASTRONOMY_API_ID;
const API_SECRET = process.env.ASTRONOMY_API_SECRET;
const BASE_URL = 'https://api.astronomyapi.com/api/v2';

function getAuthHeader(): string {
  if (!API_ID || !API_SECRET) return '';
  return `Basic ${Buffer.from(`${API_ID}:${API_SECRET}`).toString('base64')}`;
}

function calculateApproxPlanetPositions(lat: number, lng: number): CelestialBody[] {
  const d = (Date.now() - 946728000000) / 86400000;
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  let lst = (100.46 + 0.9856473662 * d + lng + 15 * utcHours) % 360;
  if (lst < 0) lst += 360;

  const ecl = (23.4393 - 3.563e-7 * d) * (Math.PI / 180);
  const planetsInfo: Record<string, { period: number; L0: number; p: number; a: number; e: number; i: number; N: number; mag: number; constell: string }> = {
    mercury: { period: 0.2408, L0: 252.25, p: 77.46, a: 0.3871, e: 0.2056, i: 7.00, N: 48.33, mag: 0.5, constell: 'Taurus' },
    venus: { period: 0.6152, L0: 181.98, p: 131.56, a: 0.7233, e: 0.0068, i: 3.39, N: 76.68, mag: -4.2, constell: 'Gemini' },
    mars: { period: 1.8808, L0: 355.45, p: 336.06, a: 1.5237, e: 0.0934, i: 1.85, N: 49.56, mag: 1.2, constell: 'Aries' },
    jupiter: { period: 11.8626, L0: 34.35, p: 14.33, a: 5.2026, e: 0.0485, i: 1.30, N: 100.46, mag: -2.0, constell: 'Pisces' },
    saturn: { period: 29.4475, L0: 50.08, p: 92.83, a: 9.5549, e: 0.0555, i: 2.49, N: 113.69, mag: 0.8, constell: 'Aquarius' },
    uranus: { period: 84.0168, L0: 314.05, p: 172.43, a: 19.2184, e: 0.0464, i: 0.77, N: 74.01, mag: 5.7, constell: 'Aries' },
    neptune: { period: 164.7913, L0: 304.35, p: 46.68, a: 30.1104, e: 0.0090, i: 1.77, N: 131.78, mag: 7.8, constell: 'Pegasus' }
  };

  const earthM = (357.529 + 0.98560028 * d) * (Math.PI / 180);
  const earthC = (1.9148 * Math.sin(earthM) + 0.02 * Math.sin(2 * earthM)) * (Math.PI / 180);
  const earthLon = (earthM + earthC + 282.94 * (Math.PI / 180)) % (2 * Math.PI);
  const earthR = 1.00014 * (1 - 0.01671 * Math.cos(earthM));
  const earthX = earthR * Math.cos(earthLon);
  const earthY = earthR * Math.sin(earthLon);
  const latRad = (lat * Math.PI) / 180;

  return Object.entries(planetsInfo).map(([id, info]) => {
    const M = (info.L0 - info.p + (360 / info.period) * (d / 365.25)) * (Math.PI / 180);
    const C = (2 * info.e * Math.sin(M) + 1.25 * info.e * info.e * Math.sin(2 * M)) * (Math.PI / 180);
    const lon = (M + C + info.p * (Math.PI / 180)) % (2 * Math.PI);
    const r = info.a * (1 - info.e * info.e) / (1 + info.e * Math.cos(M + C));
    const hX = r * Math.cos(lon);
    const hY = r * Math.sin(lon);
    const gX = hX - earthX;
    const gY = hY - earthY;
    const gZ = r * Math.sin(lon) * Math.sin(info.i * (Math.PI / 180));
    const raRad = Math.atan2(gY, gX);
    const decRad = Math.atan2(gZ, Math.sqrt(gX * gX + gY * gY));
    let ra = raRad * (180 / Math.PI);
    if (ra < 0) ra += 360;
    const dec = decRad * (180 / Math.PI);
    let ha = lst - ra;
    if (ha < 0) ha += 360;
    const haRad = (ha * Math.PI) / 180;
    const altRad = Math.asin(Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad));
    let azRad = Math.atan2(-Math.sin(haRad), Math.cos(latRad) * Math.tan(decRad) - Math.sin(latRad) * Math.cos(haRad));
    const altitude = altRad * (180 / Math.PI);
    let azimuth = azRad * (180 / Math.PI);
    azimuth = (azimuth + 360) % 360;

    const raHours = Math.floor(ra / 15);
    const raMinutes = Math.floor((ra % 15) * 4);
    const raString = `${raHours}h ${raMinutes}m`;
    const decString = `${dec >= 0 ? '+' : ''}${dec.toFixed(1)}°`;

    const transitUTCHours = ((ra - (100.46 + 0.9856473662 * d + lng)) / 15) % 24;
    const transitTime = new Date();
    transitTime.setUTCHours(transitUTCHours < 0 ? transitUTCHours + 24 : transitUTCHours);
    transitTime.setUTCMinutes(0);
    transitTime.setUTCSeconds(0);

    return {
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      type: 'planet' as const,
      altitude,
      azimuth,
      magnitude: info.mag,
      rightAscension: raString,
      declination: decString,
      constellation: info.constell,
      isVisible: altitude > 0,
      riseTime: new Date(transitTime.getTime() - 6 * 3600000).toISOString(),
      setTime: new Date(transitTime.getTime() + 6 * 3600000).toISOString(),
      transitTime: transitTime.toISOString(),
      distanceAU: Math.sqrt(gX * gX + gY * gY + gZ * gZ),
      illumination: 100,
    };
  });
}

export async function fetchPlanetPositions(lat: number, lng: number): Promise<CelestialBody[]> {
  const auth = getAuthHeader();
  if (!auth) return calculateApproxPlanetPositions(lat, lng);

  try {
    const now = new Date();
    const body = {
      style: { type: 'default' },
      observer: {
        latitude: lat,
        longitude: lng,
        date: now.toISOString().split('T')[0],
      },
      view: { type: 'portrait-simple' },
    };

    const res = await fetch(`${BASE_URL}/bodies/positions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`AstronomyAPI error: ${res.status}`);
    const data = await res.json();

    const planetNames = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.data?.table?.rows || [])
      .filter((row: any) => planetNames.includes(row.entry?.name))
      .map((row: any) => {
        const pos = row.cells?.[0]?.position || {};
        const horizonal = pos.horizonal || {};
        const equatorial = pos.equatorial || {};
        return {
          id: (row.entry?.name || '').toString().toLowerCase(),
          name: row.entry?.name || '',
          type: 'planet' as const,
          altitude: parseFloat(horizonal.altitude?.degrees || '0'),
          azimuth: parseFloat(horizonal.azimuth?.degrees || '0'),
          magnitude: parseFloat(pos.magnitude || '0'),
          rightAscension: equatorial.rightAscension?.string || '',
          declination: equatorial.declination?.string || '',
          constellation: pos.constellation?.name || '',
          isVisible: parseFloat(horizonal.altitude?.degrees || '0') > 0,
          riseTime: '',
          setTime: '',
          transitTime: '',
          distanceAU: parseFloat(pos.distance?.fromEarth?.au || '0'),
          illumination: parseFloat(pos.illumination?.fraction || '1') * 100,
        };
      });
  } catch (error) {
    console.error('Failed to fetch planet positions:', error);
    return calculateApproxPlanetPositions(lat, lng);
  }
}

export async function fetchMoonPhase(lat: number, lng: number): Promise<MoonPhase> {
  const auth = getAuthHeader();
  if (!auth) return mockMoonPhase;

  try {
    const now = new Date();
    const res = await fetch(`${BASE_URL}/studio/moon-phase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      body: JSON.stringify({
        format: 'png',
        style: {
          moonStyle: 'default',
          backgroundStyle: 'stars',
          backgroundColor: 'transparent',
          headingColor: 'white',
          textColor: 'white',
        },
        observer: {
          latitude: lat,
          longitude: lng,
          date: now.toISOString().split('T')[0],
        },
        view: { type: 'portrait-simple' },
      }),
    });

    if (!res.ok) throw new Error(`AstronomyAPI moon error: ${res.status}`);
    // Return mock with enhanced data since the API returns an image
    return mockMoonPhase;
  } catch (error) {
    console.error('Failed to fetch moon phase:', error);
    return mockMoonPhase;
  }
}

export async function fetchSunData(lat: number, lng: number): Promise<SunData> {
  // Open-Meteo provides sunrise/sunset data which we use as fallback
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=sunrise,sunset&timezone=auto&forecast_days=1`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`Sun data error: ${res.status}`);
    const data = await res.json();

    return {
      ...mockSunData,
      sunrise: data.daily?.sunrise?.[0] || mockSunData.sunrise,
      sunset: data.daily?.sunset?.[0] || mockSunData.sunset,
    };
  } catch (error) {
    console.error('Failed to fetch sun data:', error);
    return mockSunData;
  }
}
