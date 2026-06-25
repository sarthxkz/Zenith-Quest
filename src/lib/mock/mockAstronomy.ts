import type { CelestialBody, MoonPhase, SunData, MeteorShower, APOD, NearEarthObject, SolarActivity } from '../types/astronomy';

export const mockPlanets: CelestialBody[] = [
  {
    id: 'jupiter', name: 'Jupiter', type: 'planet', altitude: 45.2, azimuth: 120.5, magnitude: -2.5,
    rightAscension: '02h 15m', declination: '+12° 30\'', constellation: 'Aries',
    isVisible: true, riseTime: '2024-01-15T18:30:00Z', setTime: '2024-01-16T05:15:00Z',
    transitTime: '2024-01-15T23:45:00Z', distanceAU: 4.5, illumination: 99.2,
  },
  {
    id: 'saturn', name: 'Saturn', type: 'planet', altitude: 32.8, azimuth: 195.3, magnitude: 0.8,
    rightAscension: '22h 48m', declination: '-08° 15\'', constellation: 'Aquarius',
    isVisible: true, riseTime: '2024-01-15T17:00:00Z', setTime: '2024-01-16T03:30:00Z',
    transitTime: '2024-01-15T22:15:00Z', distanceAU: 9.8, illumination: 100,
  },
  {
    id: 'venus', name: 'Venus', type: 'planet', altitude: -5.0, azimuth: 260.0, magnitude: -3.9,
    rightAscension: '18h 30m', declination: '-22° 10\'', constellation: 'Sagittarius',
    isVisible: false, riseTime: '2024-01-15T06:00:00Z', setTime: '2024-01-15T16:45:00Z',
    transitTime: '2024-01-15T11:22:00Z', distanceAU: 1.2, illumination: 75,
  },
  {
    id: 'mars', name: 'Mars', type: 'planet', altitude: 58.1, azimuth: 88.7, magnitude: 1.2,
    rightAscension: '05h 42m', declination: '+24° 05\'', constellation: 'Taurus',
    isVisible: true, riseTime: '2024-01-15T16:45:00Z', setTime: '2024-01-16T06:30:00Z',
    transitTime: '2024-01-15T23:37:00Z', distanceAU: 1.8, illumination: 92,
  },
  {
    id: 'mercury', name: 'Mercury', type: 'planet', altitude: -15.0, azimuth: 280.0, magnitude: 0.5,
    rightAscension: '19h 10m', declination: '-25° 30\'', constellation: 'Sagittarius',
    isVisible: false, riseTime: '2024-01-15T07:30:00Z', setTime: '2024-01-15T17:00:00Z',
    transitTime: '2024-01-15T12:15:00Z', distanceAU: 0.8, illumination: 45,
  },
];

export const mockMoonPhase: MoonPhase = {
  phase: 'Waxing Gibbous',
  illumination: 78,
  age: 10.5,
  emoji: '🌔',
  nextFullMoon: '2024-01-25T17:54:00Z',
  nextNewMoon: '2024-02-09T22:59:00Z',
  riseTime: '2024-01-15T14:30:00Z',
  setTime: '2024-01-16T04:15:00Z',
};

export const mockSunData: SunData = {
  sunrise: '2024-01-15T07:18:00Z',
  sunset: '2024-01-15T17:05:00Z',
  solarNoon: '2024-01-15T12:11:00Z',
  dayLength: '9h 47m',
  civilTwilightStart: '2024-01-15T06:48:00Z',
  civilTwilightEnd: '2024-01-15T17:35:00Z',
  nauticalTwilightStart: '2024-01-15T06:15:00Z',
  nauticalTwilightEnd: '2024-01-15T18:07:00Z',
  astronomicalTwilightStart: '2024-01-15T05:42:00Z',
  astronomicalTwilightEnd: '2024-01-15T18:40:00Z',
  goldenHourStart: '2024-01-15T16:25:00Z',
  goldenHourEnd: '2024-01-15T17:05:00Z',
};

export const mockMeteorShowers: MeteorShower[] = [
  {
    name: 'Quadrantids', peakDate: '2024-01-04', ratePerHour: 110,
    radiantConstellation: 'Boötes', status: 'past', bestViewingTime: '02:00 AM - 05:00 AM',
    moonInterference: 'low',
  },
  {
    name: 'Lyrids', peakDate: '2024-04-22', ratePerHour: 18,
    radiantConstellation: 'Lyra', status: 'upcoming', bestViewingTime: '11:00 PM - 04:00 AM',
    moonInterference: 'moderate',
  },
  {
    name: 'Perseids', peakDate: '2024-08-12', ratePerHour: 100,
    radiantConstellation: 'Perseus', status: 'upcoming', bestViewingTime: '10:00 PM - 04:00 AM',
    moonInterference: 'none',
  },
];

export const mockAPOD: APOD = {
  title: 'The Horsehead Nebula in Infrared',
  date: '2024-01-15',
  explanation: 'The famous Horsehead Nebula in Orion is not the dark nebula but rather the dark region below. Also known as Barnard 33, the dark nebula is a cold, dense cloud made of gas and dust, silhouetted against the bright emission nebula IC 434.',
  url: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Barnard_33_%28Horsehead_Nebula%29.jpg',
  hdurl: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Barnard_33_%28Horsehead_Nebula%29.jpg',
  mediaType: 'image',
  copyright: 'NASA/ESA/JWST',
};

export const mockNEOs: NearEarthObject[] = [
  {
    id: '1', name: '2024 AB1', estimatedDiameter: { min: 50, max: 120 },
    closeApproachDate: '2024-01-20', missDistance: { kilometers: '5,200,000', lunar: '13.52' },
    relativeVelocity: '15.2 km/s', isPotentiallyHazardous: false,
  },
  {
    id: '2', name: '2024 CD3', estimatedDiameter: { min: 200, max: 450 },
    closeApproachDate: '2024-02-14', missDistance: { kilometers: '2,100,000', lunar: '5.46' },
    relativeVelocity: '22.8 km/s', isPotentiallyHazardous: true,
  },
  {
    id: '3', name: '2024 EF5', estimatedDiameter: { min: 30, max: 65 },
    closeApproachDate: '2024-01-25', missDistance: { kilometers: '8,900,000', lunar: '23.15' },
    relativeVelocity: '11.5 km/s', isPotentiallyHazardous: false,
  },
];

export const mockSolarActivity: SolarActivity = {
  solarFlareCount: 3,
  kpIndex: 4,
  solarWindSpeed: 450,
  geomagneticStorm: 'minor',
  auroraForecast: 'Visible at high latitudes (60°+)',
};
