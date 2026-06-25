import type { Satellite, SatellitePass } from '../types/satellite';
import { mockSatellites, mockSatellitePasses } from '../mock/mockSatellites';
import { NOTABLE_SATELLITES, SatelliteCategory } from '../types/satellite';

const N2YO_API_KEY = process.env.N2YO_API_KEY;
const BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';

function calculateApproxAzimuth(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  let brng = Math.atan2(y, x) * (180 / Math.PI);
  return (brng + 360) % 360;
}

function calculateApproxElevation(lat1: number, lng1: number, lat2: number, lng2: number, satAlt: number): number {
  const R = 6371; // Earth radius in km
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const dLat = lat2Rad - lat1Rad;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distKm = R * c;
  const rPlusH = R + satAlt;
  const dSq = R * R + rPlusH * rPlusH - 2 * R * rPlusH * Math.cos(c);
  const d = Math.sqrt(dSq);
  if (d === 0) return 90;
  const elevRad = Math.acos((dSq + R * R - rPlusH * rPlusH) / (2 * d * R)) - Math.PI / 2;
  return elevRad * (180 / Math.PI);
}

export async function fetchSatellitePositions(
  satelliteId: number,
  lat: number,
  lng: number,
  alt: number = 0,
  seconds: number = 1
): Promise<Satellite | null> {
  if (satelliteId === 25544) {
    try {
      const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      if (res.ok) {
        const data = await res.json();
        const elevation = calculateApproxElevation(lat, lng, data.latitude, data.longitude, data.altitude);
        const azimuth = calculateApproxAzimuth(lat, lng, data.latitude, data.longitude);
        return {
          id: 25544,
          name: 'ISS (ZARYA)',
          type: 'iss',
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude,
          velocity: data.velocity / 3600, // km/s
          azimuth,
          elevation,
          rightAscension: 0,
          declination: 0,
          timestamp: data.timestamp * 1000,
          isVisible: elevation > 0,
          magnitude: -3.8,
        };
      }
    } catch (err) {
      console.error('Failed to fetch real-time ISS from wheretheiss.at:', err);
    }
  }

  if (!N2YO_API_KEY) {
    const s = mockSatellites.find((s) => s.id === satelliteId);
    if (!s) return null;
    const t = Date.now() / 60000;
    const period = 90 + (s.id % 20);
    const offset = (s.id * 17) % 360;
    const currentLng = (((t / period) * 360 + offset + 180) % 360) - 180;
    const currentLat = Math.sin((t / period) * Math.PI * 2 + offset) * (40 + (s.id % 20));
    const elevation = calculateApproxElevation(lat, lng, currentLat, currentLng, s.altitude);
    const azimuth = calculateApproxAzimuth(lat, lng, currentLat, currentLng);
    return {
      ...s,
      latitude: currentLat,
      longitude: currentLng,
      azimuth,
      elevation,
      isVisible: elevation > 0,
      timestamp: Date.now(),
    };
  }

  try {
    const res = await fetch(
      `${BASE_URL}/positions/${satelliteId}/${lat}/${lng}/${alt}/${seconds}&apiKey=${N2YO_API_KEY}`
    );
    if (!res.ok) throw new Error(`N2YO API error: ${res.status}`);
    const data = await res.json();
    const pos = data.positions?.[0];
    if (!pos) return null;

    return {
      id: data.info.satid,
      name: data.info.satname,
      type: getSatelliteType(data.info.satname),
      latitude: pos.satlatitude,
      longitude: pos.satlongitude,
      altitude: pos.sataltitude,
      velocity: 0,
      azimuth: pos.azimuth,
      elevation: pos.elevation,
      rightAscension: pos.ra,
      declination: pos.dec,
      timestamp: pos.timestamp * 1000,
      isVisible: pos.elevation > 0 && !pos.eclipsed,
      magnitude: undefined,
    };
  } catch (error) {
    console.error('Failed to fetch satellite position:', error);
    return mockSatellites.find((s) => s.id === satelliteId) || null;
  }
}

export async function fetchVisualPasses(
  satelliteId: number,
  lat: number,
  lng: number,
  alt: number = 0,
  days: number = 5,
  minVisibility: number = 60
): Promise<SatellitePass[]> {
  if (!N2YO_API_KEY) {
    const passes = mockSatellitePasses.filter((p) => p.satelliteId === satelliteId);
    const now = Date.now();
    return passes.map((p, idx) => {
      const start = new Date(now + (idx + 1) * 45 * 60000);
      const end = new Date(start.getTime() + p.duration * 1000);
      return {
        ...p,
        startTime: start.toISOString(),
        maxTime: new Date(start.getTime() + (p.duration / 2) * 1000).toISOString(),
        endTime: end.toISOString(),
      };
    });
  }

  try {
    const res = await fetch(
      `${BASE_URL}/visualpasses/${satelliteId}/${lat}/${lng}/${alt}/${days}/${minVisibility}&apiKey=${N2YO_API_KEY}`
    );
    if (!res.ok) throw new Error(`N2YO visual passes error: ${res.status}`);
    const data = await res.json();

    return (data.passes || []).map((pass: Record<string, number>) => ({
      satellite: data.info.satname,
      satelliteId: data.info.satid,
      startTime: new Date(pass.startUTC * 1000).toISOString(),
      startAzimuth: pass.startAz,
      startAzimuthCompass: pass.startAzCompass,
      maxTime: new Date(pass.maxUTC * 1000).toISOString(),
      maxElevation: pass.maxEl,
      maxAzimuth: pass.maxAz,
      endTime: new Date(pass.endUTC * 1000).toISOString(),
      endAzimuth: pass.endAz,
      endAzimuthCompass: pass.endAzCompass,
      magnitude: pass.mag,
      duration: pass.duration,
      isVisible: true,
    }));
  } catch (error) {
    console.error('Failed to fetch visual passes:', error);
    return mockSatellitePasses.filter((p) => p.satelliteId === satelliteId);
  }
}

export async function fetchSatellitesAbove(
  lat: number,
  lng: number,
  alt: number = 0,
  radius: number = 70,
  category: SatelliteCategory = SatelliteCategory.VISIBLE
): Promise<Satellite[]> {
  if (!N2YO_API_KEY) {
    let liveISS: Satellite | null = null;
    try {
      const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      if (res.ok) {
        const data = await res.json();
        const elevation = calculateApproxElevation(lat, lng, data.latitude, data.longitude, data.altitude);
        const azimuth = calculateApproxAzimuth(lat, lng, data.latitude, data.longitude);
        liveISS = {
          id: 25544,
          name: 'ISS (ZARYA)',
          type: 'iss',
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude,
          velocity: data.velocity / 3600,
          azimuth,
          elevation,
          rightAscension: 0,
          declination: 0,
          timestamp: data.timestamp * 1000,
          isVisible: elevation > 0,
          magnitude: -3.8,
        };
      }
    } catch (err) {
      console.error('Failed to fetch ISS in satellites above:', err);
    }

    return mockSatellites.map((s) => {
      if (s.id === 25544 && liveISS) return liveISS;
      const t = Date.now() / 60000;
      const period = 95 + (s.id % 25);
      const offset = (s.id * 31) % 360;
      const currentLng = (((t / period) * 360 + offset + 180) % 360) - 180;
      const currentLat = Math.sin((t / period) * Math.PI * 2 + offset) * (45 + (s.id % 15));
      const elevation = calculateApproxElevation(lat, lng, currentLat, currentLng, s.altitude);
      const azimuth = calculateApproxAzimuth(lat, lng, currentLat, currentLng);
      return {
        ...s,
        latitude: currentLat,
        longitude: currentLng,
        azimuth,
        elevation,
        isVisible: elevation > 0,
        timestamp: Date.now(),
      };
    });
  }

  try {
    const res = await fetch(
      `${BASE_URL}/above/${lat}/${lng}/${alt}/${radius}/${category}&apiKey=${N2YO_API_KEY}`
    );
    if (!res.ok) throw new Error(`N2YO above error: ${res.status}`);
    const data = await res.json();

    return (data.above || []).map((sat: Record<string, unknown>) => ({
      id: sat.satid,
      name: sat.satname,
      type: getSatelliteType(sat.satname as string),
      latitude: sat.satlat,
      longitude: sat.satlng,
      altitude: sat.satalt,
      velocity: 0,
      azimuth: 0,
      elevation: 0,
      rightAscension: 0,
      declination: 0,
      timestamp: Date.now(),
      isVisible: true,
    }));
  } catch (error) {
    console.error('Failed to fetch satellites above:', error);
    return mockSatellites;
  }
}

export async function fetchISSPosition(lat: number = 0, lng: number = 0): Promise<Satellite | null> {
  return fetchSatellitePositions(NOTABLE_SATELLITES.ISS, lat, lng, 0, 1);
}

function getSatelliteType(name: string): Satellite['type'] {
  const upper = (name || '').toUpperCase();
  if (upper.includes('ISS') || upper.includes('ZARYA')) return 'iss';
  if (upper.includes('STARLINK')) return 'starlink';
  if (upper.includes('NOAA') || upper.includes('GOES') || upper.includes('METEO')) return 'weather';
  if (upper.includes('IRIDIUM') || upper.includes('INTELSAT') || upper.includes('SES')) return 'communication';
  if (upper.includes('HUBBLE') || upper.includes('CHANDRA') || upper.includes('JWST')) return 'scientific';
  return 'other';
}
