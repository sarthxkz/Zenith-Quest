export interface Satellite {
  id: number; // NORAD ID
  name: string;
  type: 'iss' | 'starlink' | 'weather' | 'communication' | 'scientific' | 'other';
  latitude: number;
  longitude: number;
  altitude: number; // km
  velocity: number; // km/s
  azimuth: number;
  elevation: number;
  rightAscension: number;
  declination: number;
  timestamp: number;
  isVisible: boolean;
  magnitude?: number;
}

export interface SatellitePass {
  satellite: string;
  satelliteId: number;
  startTime: string;
  startAzimuth: number;
  startAzimuthCompass: string;
  maxTime: string;
  maxElevation: number;
  maxAzimuth: number;
  endTime: string;
  endAzimuth: number;
  endAzimuthCompass: string;
  magnitude: number;
  duration: number; // seconds
  isVisible: boolean;
}

export interface SatellitePosition {
  latitude: number;
  longitude: number;
  altitude: number;
  azimuth: number;
  elevation: number;
  rightAscension: number;
  declination: number;
  timestamp: number;
  eclipsed: boolean;
}

export interface SatelliteTrackingData {
  info: {
    name: string;
    id: number;
    transactionsCount: number;
  };
  positions: SatellitePosition[];
}

// N2YO category IDs
export enum SatelliteCategory {
  ALL = 0,
  BRIGHTEST = 1,
  ISS = 2,
  WEATHER = 3,
  NOAA = 4,
  GOES = 5,
  EARTH_RESOURCES = 6,
  SEARCH_RESCUE = 7,
  DISASTER_MONITORING = 8,
  TRACKING_DATA_RELAY = 9,
  GEOSTATIONARY = 10,
  INTELSAT = 11,
  GORIZONT = 12,
  RADUGA = 13,
  MOLNIYA = 14,
  IRIDIUM = 15,
  ORBCOMM = 16,
  GLOBALSTAR = 17,
  AMATEUR_RADIO = 18,
  VISIBLE = 19,
  SPECIAL_INTEREST = 20,
  STARLINK = 52,
}

export const NOTABLE_SATELLITES = {
  ISS: 25544,
  HST: 20580, // Hubble Space Telescope
  TIANGONG: 48274,
  CSS: 54216, // Chinese Space Station
} as const;
