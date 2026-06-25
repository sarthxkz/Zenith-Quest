import type { TimelineEvent } from '../types/skyScore';
import type { SunData, CelestialBody, MoonPhase } from '../types/astronomy';
import type { SatellitePass } from '../types/satellite';

export function generateTimeline(
  sunData: SunData,
  moonPhase: MoonPhase,
  planets: CelestialBody[],
  satellitePasses: SatellitePass[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Sunset
  events.push({
    id: 'sunset',
    time: sunData.sunset,
    title: 'Sunset',
    description: 'The Sun sets below the horizon. Stargazing preparations begin.',
    type: 'sunset',
    icon: '🌅',
    importance: 'medium',
  });

  // Civil Twilight End
  events.push({
    id: 'twilight-civil',
    time: sunData.civilTwilightEnd,
    title: 'Civil Twilight Ends',
    description: 'Bright planets and the Moon become visible.',
    type: 'twilight',
    icon: '🌆',
    importance: 'low',
  });

  // Astronomical Twilight End
  events.push({
    id: 'twilight-astro',
    time: sunData.astronomicalTwilightEnd,
    title: 'Astronomical Twilight Ends',
    description: 'Full darkness — perfect for deep sky observing.',
    type: 'twilight',
    icon: '🌌',
    importance: 'medium',
  });

  // Moonrise
  events.push({
    id: 'moonrise',
    time: moonPhase.riseTime,
    title: `Moonrise — ${moonPhase.phase}`,
    description: `The ${moonPhase.phase} Moon rises. Illumination: ${moonPhase.illumination}%.`,
    type: 'moonrise',
    icon: moonPhase.emoji,
    importance: 'medium',
  });

  // Planet visibility peaks
  planets
    .filter((p) => p.isVisible)
    .forEach((planet) => {
      events.push({
        id: `planet-${planet.id}`,
        time: planet.transitTime,
        title: `${planet.name} Peak Visibility`,
        description: `${planet.name} reaches its highest point at ${planet.altitude.toFixed(1)}° altitude in ${planet.constellation}.`,
        type: 'planet',
        icon: '🪐',
        importance: planet.magnitude < 0 ? 'high' : 'medium',
        details: {
          Magnitude: planet.magnitude.toFixed(1),
          Altitude: `${planet.altitude.toFixed(1)}°`,
          Constellation: planet.constellation,
        },
      });
    });

  // Satellite passes
  satellitePasses.forEach((pass) => {
    events.push({
      id: `sat-${pass.satelliteId}-${pass.startTime}`,
      time: pass.startTime,
      title: `${pass.satellite} Pass`,
      description: `${pass.satellite} passes overhead. Max elevation: ${pass.maxElevation}°. Duration: ${Math.round(pass.duration / 60)} min.`,
      type: pass.satellite.includes('ISS') ? 'iss' : pass.satellite.includes('STARLINK') ? 'starlink' : 'satellite',
      icon: pass.satellite.includes('ISS') ? '🚀' : '🛰️',
      importance: pass.maxElevation > 45 ? 'high' : 'medium',
      details: {
        'Start Direction': pass.startAzimuthCompass,
        'Max Elevation': `${pass.maxElevation}°`,
        'End Direction': pass.endAzimuthCompass,
        Brightness: `mag ${pass.magnitude}`,
      },
    });
  });

  // Sunrise
  events.push({
    id: 'sunrise',
    time: sunData.sunrise,
    title: 'Sunrise',
    description: 'The Sun rises. Stargazing session ends.',
    type: 'sunrise',
    icon: '🌄',
    importance: 'medium',
  });

  // Sort by time
  return events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}
