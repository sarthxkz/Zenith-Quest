'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { PLANET_COLORS } from '@/lib/utils/constants';
import { useLocationStore } from '@/lib/store/locationStore';

// ANIMATED COMETS / SHOOTING STARS IN DOME
function ShootingStars() {
  const [star, setStar] = useState<{ pos: THREE.Vector3; dir: THREE.Vector3; speed: number } | null>(null);

  useFrame((state) => {
    // Roll dice to spawn a shooting star
    if (!star && Math.random() < 0.008) {
      const startX = (Math.random() - 0.5) * 60;
      const startZ = (Math.random() - 0.5) * 60;
      setStar({
        pos: new THREE.Vector3(startX, 35, startZ),
        dir: new THREE.Vector3((Math.random() - 0.5) * 1.5, -0.6, (Math.random() - 0.5) * 1.5).normalize(),
        speed: 0.6 + Math.random() * 0.8,
      });
    }

    if (star) {
      star.pos.addScaledVector(star.dir, star.speed);
      // despawn if low or outside boundary
      if (star.pos.y < 2 || star.pos.length() > 70) {
        setStar(null);
      }
    }
  });

  const lineMesh = useMemo(() => {
    if (!star) return null;
    const points = [
      star.pos.clone(),
      star.pos.clone().addScaledVector(star.dir, -3.5) // tail length
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Line(geometry, material);
  }, [star]);

  return lineMesh ? <primitive object={lineMesh} /> : null;
}

// GLOWING CONSTELLATION MESHES
function ConstellationLines({ visible }: { visible: boolean }) {
  const lines = useMemo(() => {
    if (!visible) return [];
    const coords = [
      new THREE.Vector3(12, 16, -24),
      new THREE.Vector3(18, 25, -20),
      new THREE.Vector3(26, 20, -12),
      new THREE.Vector3(30, 10, -6),
      
      new THREE.Vector3(-18, 24, -12),
      new THREE.Vector3(-25, 14, -20),
      new THREE.Vector3(-20, 6, -28),
      
      new THREE.Vector3(2, 38, -6),
      new THREE.Vector3(14, 32, 12),
      new THREE.Vector3(-12, 30, 18),
    ];
    
    const lineMeshes: THREE.Line[] = [];
    // Draw connections
    for (let i = 0; i < coords.length - 1; i++) {
      if (i !== 3 && i !== 6) {
        const geometry = new THREE.BufferGeometry().setFromPoints([coords[i], coords[i + 1]]);
        const material = new THREE.LineBasicMaterial({ 
          color: '#06b6d4', 
          transparent: true, 
          opacity: 0.22,
          blending: THREE.AdditiveBlending
        });
        lineMeshes.push(new THREE.Line(geometry, material));
      }
    }
    return lineMeshes;
  }, [visible]);

  if (!visible) return null;

  return (
    <group>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

function CelestialSphere({ planets, showConstellations, timeOffset }: { planets: any[]; showConstellations: boolean; timeOffset: number }) {
  const diurnalRotation = (timeOffset * 15 * Math.PI) / 180;

  return (
    <group>
      {/* Diurnal Rotating Sky Elements */}
      <group rotation={[0, diurnalRotation, 0]}>
        {/* High-density star background */}
        <Stars radius={110} depth={45} count={6000} factor={4.5} saturation={0.6} fade speed={0.4} />

        {/* Constellations and meteors */}
        <ConstellationLines visible={showConstellations} />
        <ShootingStars />

        {/* Planets */}
        {planets.filter(p => p.isVisible).map((planet) => (
          <PlanetSphere key={planet.id} planet={planet} />
        ))}

        {/* Moon */}
        <MoonSphere />
      </group>

      {/* Grid lines */}
      <SkyDomeGrid />

      {/* Cardinal directions */}
      <CardinalLabels />
    </group>
  );
}

function SkyDomeGrid() {
  const gridRef = useRef<THREE.Group>(null);

  // Generate elevation circle paths
  const altitudeLines = useMemo(() => {
    const lines: THREE.Line[] = [];
    for (let alt = 15; alt <= 75; alt += 15) {
      const radius = Math.cos((alt * Math.PI) / 180) * 50;
      const y = Math.sin((alt * Math.PI) / 180) * 50;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: '#7c3aed', transparent: true, opacity: 0.12 });
      lines.push(new THREE.Line(geometry, material));
    }
    return lines;
  }, []);

  return (
    <group ref={gridRef}>
      {/* Horizon base boundary */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[49.7, 50.1, 128]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>

      {/* Altitude rings */}
      {altitudeLines.map((lineObj, i) => (
        <primitive key={i} object={lineObj} />
      ))}
    </group>
  );
}

function PlanetSphere({ planet }: { planet: typeof mockPlanets[0] }) {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Convert Azimuth and Altitude coordinates into 3D Sphere projection coordinates
  const position = useMemo(() => {
    const r = 46;
    const altRad = (planet.altitude * Math.PI) / 180;
    const azRad = ((360 - planet.azimuth) * Math.PI) / 180;
    return new THREE.Vector3(
      Math.cos(altRad) * Math.sin(azRad) * r,
      Math.sin(altRad) * r,
      Math.cos(altRad) * Math.cos(azRad) * r
    );
  }, [planet.altitude, planet.azimuth]);

  const color = PLANET_COLORS[planet.name] || '#ffffff';
  const size = Math.max(0.4, 2.2 - planet.magnitude * 0.35);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.intensity = 1.2 + Math.sin(clock.getElapsedTime() * 2.5) * 0.4;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 20, 20]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <pointLight ref={glowRef} color={color} intensity={1.5} distance={15} />
      <Text
        position={[0, size + 1.6, 0]}
        fontSize={1.3}
        color="#c4b5fd"
        anchorX="center"
        anchorY="bottom"
      >
        {planet.name}
      </Text>
    </group>
  );
}

function MoonSphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
  });

  const position = new THREE.Vector3(20, 26, -16);

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshStandardMaterial
          color="#f5efe0"
          emissive="#fbf7eb"
          emissiveIntensity={0.35}
          roughness={0.85}
        />
      </mesh>
      <pointLight color="#fbf7eb" intensity={2.2} distance={25} />
      <Text
        position={[0, 4.2, 0]}
        fontSize={1.3}
        color="#fcd34d"
        anchorX="center"
        anchorY="bottom"
      >
        Moon
      </Text>
    </group>
  );
}

function CardinalLabels() {
  const r = 52;
  const labels = [
    { text: 'N', pos: [0, 0, r] as [number, number, number], color: '#ef4444' },
    { text: 'S', pos: [0, 0, -r] as [number, number, number], color: '#3b82f6' },
    { text: 'E', pos: [r, 0, 0] as [number, number, number], color: '#22c55e' },
    { text: 'W', pos: [-r, 0, 0] as [number, number, number], color: '#f59e0b' },
  ];

  return (
    <>
      {labels.map((l) => (
        <Text
          key={l.text}
          position={l.pos}
          fontSize={3.0}
          color={l.color}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {l.text}
        </Text>
      ))}
    </>
  );
}

export default function SkyDomePage() {
  const { currentLocation } = useLocationStore();
  const [showConstellations, setShowConstellations] = useState(true);
  const [timeOffset, setTimeOffset] = useState(0); // hours

  // Keplerian orbits approximation calculated locally to support 60 FPS slider animations
  const planetsList = useMemo(() => {
    const lat = currentLocation?.latitude || 40.7128;
    const lng = currentLocation?.longitude || -74.006;
    
    // Base J2000 epoch days offset by time-travel hours
    const baseTime = Date.now() + timeOffset * 3600000;
    const d = (baseTime - 946728000000) / 86400000;
    
    const now = new Date(baseTime);
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
    let lst = (100.46 + 0.9856473662 * d + lng + 15 * utcHours) % 360;
    if (lst < 0) lst += 360;

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
      const altitude = altRad * (180 / Math.PI);
      let azRad = Math.atan2(-Math.sin(haRad), Math.cos(latRad) * Math.tan(decRad) - Math.sin(latRad) * Math.cos(haRad));
      let azimuth = azRad * (180 / Math.PI);
      azimuth = (azimuth + 360) % 360;

      return {
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        type: 'planet' as const,
        altitude,
        azimuth,
        magnitude: info.mag,
        isVisible: altitude > 0,
      };
    });
  }, [currentLocation, timeOffset]);

  const targetTime = useMemo(() => {
    return new Date(Date.now() + timeOffset * 3600000);
  }, [timeOffset]);

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Header overlay */}
      <div className="absolute top-8 left-8 z-10 font-sans cursor-none select-none">
        <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          3D Sky Dome
        </h1>
        <p className="text-sm text-slate-400 font-light">
          Active observer coordinates above{' '}
          <span className="text-purple-400 font-extrabold font-mono">
            {currentLocation?.city || 'Detecting Location...'}
          </span>
        </p>
      </div>

      {/* Control Station (Hour Slider & settings) */}
      <div className="absolute bottom-8 left-8 z-10 glass-card-static p-6 space-y-4 min-w-[320px] max-w-[400px] hud-grid opacity-95 select-none text-xs">
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />

        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">
          Celestial Controller
        </h4>

        {/* Time travel slider */}
        <div className="space-y-1.5 font-mono">
          <div className="flex justify-between text-slate-400">
            <span>TIME TRAVEL</span>
            <span className="text-cyan-400 font-extrabold">
              {timeOffset === 0
                ? 'REAL-TIME'
                : `${timeOffset > 0 ? '+' : ''}${timeOffset.toFixed(1)} hrs`}
            </span>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            step="0.5"
            value={timeOffset}
            onChange={(e) => setTimeOffset(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
            <span>-12H</span>
            <span>{targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>+12H</span>
          </div>
        </div>

        {/* Toggle Toggles */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setShowConstellations((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl border text-[10px] font-mono uppercase tracking-wider transition-all cursor-none ${
              showConstellations
                ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300 font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-white/[0.02] border-white/5 text-slate-500 hover:bg-white/5'
            }`}
          >
            🌌 Constellations: {showConstellations ? 'ON' : 'OFF'}
          </button>

          {timeOffset !== 0 && (
            <button
              onClick={() => setTimeOffset(0)}
              className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/35 text-[10px] font-mono uppercase tracking-wider text-purple-300 hover:bg-purple-500/20 transition-all cursor-none"
            >
              🔄 Reset Clock
            </button>
          )}
        </div>
      </div>

      {/* Cyber legend ledger card */}
      <div className="absolute bottom-8 right-8 z-10 glass-card-static p-6 space-y-3.5 min-w-[240px] hud-grid opacity-90 select-none">
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />

        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">
          Tracking Ledger
        </h4>
        {planetsList.filter((p) => p.isVisible).map((planet) => (
          <div key={planet.id} className="flex items-center gap-3 text-xs font-mono">
            <div className="w-2.5 h-2.5 rounded-full relative" style={{ backgroundColor: PLANET_COLORS[planet.name] }}>
              <span className="absolute inset-[-3px] rounded-full border border-dashed animate-pulse-glow" style={{ borderColor: PLANET_COLORS[planet.name] }} />
            </div>
            <span className="text-slate-300 font-bold tracking-wide">{planet.name}</span>
            <span className="text-slate-500 ml-auto font-semibold">MAG {planet.magnitude.toFixed(1)}</span>
          </div>
        ))}
        {planetsList.filter((p) => p.isVisible).length === 0 && (
          <div className="text-center py-6 text-xs font-mono text-slate-500">
            No planets overhead at selected time
          </div>
        )}
      </div>

      {/* Controls HUD Hint */}
      <div className="absolute top-8 right-8 z-10 glass-card-static px-4 py-2 font-mono text-[10px] text-slate-400 select-none">
        <span>🖱 DRAG TO SCAN · SCROLL TO ZOOM</span>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 18, 52], fov: 58 }}
        style={{ background: '#030014' }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.15} />
        <CelestialSphere
          planets={planetsList}
          showConstellations={showConstellations}
          timeOffset={timeOffset}
        />
        <OrbitControls
          enablePan={false}
          minDistance={15}
          maxDistance={75}
          autoRotate={timeOffset === 0}
          autoRotateSpeed={0.15}
        />
      </Canvas>
    </div>
  );
}
