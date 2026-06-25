import type { Satellite, SatellitePass } from '../types/satellite';

export const mockSatellites: Satellite[] = [
  {
    id: 25544, name: 'ISS (ZARYA)', type: 'iss',
    latitude: 28.5, longitude: -80.6, altitude: 420, velocity: 7.66,
    azimuth: 45, elevation: 62, rightAscension: 12.5, declination: 28.3,
    timestamp: Date.now(), isVisible: true, magnitude: -3.5,
  },
  {
    id: 55001, name: 'STARLINK-5001', type: 'starlink',
    latitude: 35.2, longitude: -90.1, altitude: 550, velocity: 7.59,
    azimuth: 120, elevation: 35, rightAscension: 8.2, declination: 45.1,
    timestamp: Date.now(), isVisible: true, magnitude: 2.5,
  },
  {
    id: 55002, name: 'STARLINK-5002', type: 'starlink',
    latitude: 34.8, longitude: -89.5, altitude: 550, velocity: 7.59,
    azimuth: 122, elevation: 33, rightAscension: 8.3, declination: 44.8,
    timestamp: Date.now(), isVisible: true, magnitude: 2.8,
  },
  {
    id: 55003, name: 'STARLINK-5003', type: 'starlink',
    latitude: 34.5, longitude: -88.9, altitude: 550, velocity: 7.59,
    azimuth: 124, elevation: 31, rightAscension: 8.4, declination: 44.5,
    timestamp: Date.now(), isVisible: true, magnitude: 3.0,
  },
  {
    id: 20580, name: 'HUBBLE SPACE TELESCOPE', type: 'scientific',
    latitude: -15.3, longitude: 45.2, altitude: 540, velocity: 7.59,
    azimuth: 200, elevation: -10, rightAscension: 15.7, declination: -18.2,
    timestamp: Date.now(), isVisible: false, magnitude: 1.5,
  },
  {
    id: 48274, name: 'TIANGONG', type: 'other',
    latitude: 22.1, longitude: 110.5, altitude: 390, velocity: 7.68,
    azimuth: 300, elevation: -5, rightAscension: 20.1, declination: 22.5,
    timestamp: Date.now(), isVisible: false, magnitude: -1.0,
  },
];

export const mockSatellitePasses: SatellitePass[] = [
  {
    satellite: 'ISS', satelliteId: 25544,
    startTime: '2024-01-15T19:52:00Z', startAzimuth: 220, startAzimuthCompass: 'SW',
    maxTime: '2024-01-15T19:55:00Z', maxElevation: 62, maxAzimuth: 310,
    endTime: '2024-01-15T19:58:00Z', endAzimuth: 40, endAzimuthCompass: 'NE',
    magnitude: -3.5, duration: 360, isVisible: true,
  },
  {
    satellite: 'ISS', satelliteId: 25544,
    startTime: '2024-01-16T21:18:00Z', startAzimuth: 195, startAzimuthCompass: 'SSW',
    maxTime: '2024-01-16T21:21:00Z', maxElevation: 45, maxAzimuth: 280,
    endTime: '2024-01-16T21:24:00Z', endAzimuth: 10, endAzimuthCompass: 'N',
    magnitude: -2.8, duration: 360, isVisible: true,
  },
  {
    satellite: 'STARLINK-5001', satelliteId: 55001,
    startTime: '2024-01-15T20:15:00Z', startAzimuth: 180, startAzimuthCompass: 'S',
    maxTime: '2024-01-15T20:18:00Z', maxElevation: 35, maxAzimuth: 260,
    endTime: '2024-01-15T20:21:00Z', endAzimuth: 340, endAzimuthCompass: 'NNW',
    magnitude: 2.5, duration: 360, isVisible: true,
  },
  {
    satellite: 'TIANGONG', satelliteId: 48274,
    startTime: '2024-01-15T22:45:00Z', startAzimuth: 240, startAzimuthCompass: 'WSW',
    maxTime: '2024-01-15T22:48:00Z', maxElevation: 28, maxAzimuth: 320,
    endTime: '2024-01-15T22:51:00Z', endAzimuth: 30, endAzimuthCompass: 'NNE',
    magnitude: -1.0, duration: 360, isVisible: true,
  },
];
