import type { Mission } from '../types/mission';
import type { CelestialBody } from '../types/astronomy';
import type { SatellitePass } from '../types/satellite';

export function generateMissions(
  planets: CelestialBody[],
  satellitePasses: SatellitePass[],
  completedMissionIds: string[] = []
): Mission[] {
  const missions: Mission[] = [];

  // Planet observation missions
  planets.filter((p) => p.isVisible).forEach((planet) => {
    const id = `observe-${planet.id}`;
    if (completedMissionIds.includes(id)) return;
    missions.push({
      id,
      title: `Observe ${planet.name}`,
      description: `Find and observe ${planet.name} in the ${getDirectionFromAzimuth(planet.azimuth)} sky. It's currently at ${planet.altitude.toFixed(1)}° altitude in ${planet.constellation}.`,
      type: 'observation',
      difficulty: planet.magnitude < 0 ? 'beginner' : 'intermediate',
      xpReward: planet.magnitude < 0 ? 100 : 150,
      target: planet.name,
      targetType: 'planet',
      requirements: [`${planet.name} above horizon`, 'Clear sky visibility'],
      status: 'available',
      progress: 0,
      icon: getPlanetIcon(planet.name),
    });
  });

  // ISS tracking missions
  const issPasses = satellitePasses.filter((p) => p.satellite.includes('ISS'));
  if (issPasses.length > 0 && !completedMissionIds.includes('track-iss')) {
    missions.push({
      id: 'track-iss',
      title: 'Track ISS Pass',
      description: `Watch the International Space Station pass overhead. Next pass at max elevation ${issPasses[0].maxElevation}°.`,
      type: 'tracking',
      difficulty: 'beginner',
      xpReward: 150,
      target: 'ISS',
      targetType: 'satellite',
      requirements: ['ISS pass scheduled', 'Clear sky'],
      status: 'available',
      progress: 0,
      icon: '🚀',
    });
  }

  // Starlink train tracking
  const starlinkPasses = satellitePasses.filter((p) => p.satellite.includes('STARLINK'));
  if (starlinkPasses.length > 0 && !completedMissionIds.includes('track-starlink')) {
    missions.push({
      id: 'track-starlink',
      title: 'Track Starlink Train',
      description: 'Observe a train of Starlink satellites passing overhead. They appear as a line of bright dots.',
      type: 'tracking',
      difficulty: 'intermediate',
      xpReward: 200,
      target: 'Starlink',
      targetType: 'satellite',
      requirements: ['Starlink pass scheduled', 'Clear sky', 'Dark conditions'],
      status: 'available',
      progress: 0,
      icon: '🛰️',
    });
  }

  // Constellation identification missions
  const constellationMissions = [
    { name: 'Orion', difficulty: 'beginner' as const, xp: 120 },
    { name: 'Ursa Major', difficulty: 'beginner' as const, xp: 100 },
    { name: 'Cassiopeia', difficulty: 'beginner' as const, xp: 100 },
    { name: 'Scorpius', difficulty: 'intermediate' as const, xp: 150 },
    { name: 'Cygnus', difficulty: 'intermediate' as const, xp: 150 },
  ];

  constellationMissions.forEach((c) => {
    const id = `identify-${c.name.toLowerCase().replace(/\s/g, '-')}`;
    if (completedMissionIds.includes(id)) return;
    missions.push({
      id,
      title: `Identify ${c.name}`,
      description: `Locate the constellation ${c.name} in the night sky and identify its main stars.`,
      type: 'identification',
      difficulty: c.difficulty,
      xpReward: c.xp,
      target: c.name,
      targetType: 'constellation',
      requirements: ['Dark sky conditions', `${c.name} visible in sky`],
      status: 'available',
      progress: 0,
      icon: '⭐',
    });
  });

  return missions;
}

function getDirectionFromAzimuth(azimuth: number): string {
  if (azimuth >= 315 || azimuth < 45) return 'northern';
  if (azimuth >= 45 && azimuth < 135) return 'eastern';
  if (azimuth >= 135 && azimuth < 225) return 'southern';
  return 'western';
}

function getPlanetIcon(name: string): string {
  const icons: Record<string, string> = {
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '⛢',
    Neptune: '♆',
  };
  return icons[name] || '🪐';
}
