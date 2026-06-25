'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocationStore } from '@/lib/store/locationStore';
import GlassCard from './GlassCard';

// 1. PROCEDURAL NEON TEXTURE GENERATOR FOR THE 3D EARTH
function createProceduralEarthTexture() {
  if (typeof window === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Deep space ocean blue background
  ctx.fillStyle = '#05081c';
  ctx.fillRect(0, 0, 1024, 512);

  // Hologram grid scan lines
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 1024; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
  }
  for (let j = 0; j < 512; j += 32) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(1024, j);
    ctx.stroke();
  }

  // Draw simple polygon coordinate approximations for main continents
  const drawContinent = (points: [number, number][]) => {
    ctx.beginPath();
    points.forEach(([lng, lat], index) => {
      // Map longitude [-180, 180] to canvas X [0, 1024]
      const x = ((lng + 180) / 360) * 1024;
      // Map latitude [-90, 90] to canvas Y [512, 0]
      const y = ((90 - lat) / 180) * 512;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    // Glowing fill
    const grad = ctx.createRadialGradient(512, 256, 10, 512, 256, 500);
    grad.addColorStop(0, 'rgba(99, 102, 241, 0.25)'); // Indigo
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.12)');  // Cyan
    ctx.fillStyle = grad;
    ctx.fill();

    // Glowing cyan board borders
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(6, 182, 212, 0.7)';
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset
  };

  // North America
  drawContinent([
    [-168, 65], [-60, 75], [-52, 55], [-50, 48], [-80, 24], 
    [-100, 15], [-105, 20], [-115, 30], [-125, 48], [-160, 55]
  ]);
  // South America
  drawContinent([
    [-80, 12], [-46, -6], [-35, -7], [-70, -55], [-76, -42], [-82, -5]
  ]);
  // Eurasia / Africa / India
  drawContinent([
    [-10, 65], [10, 72], [40, 75], [80, 75], [165, 70], [170, 60],
    [140, 35], [120, 20], [100, 5], [80, 6], [74, 15], [60, 12],
    [48, 25], [32, 30], [20, 10], [15, -32], [-10, -25], [-15, 5],
    [-17, 15], [-16, 32], [-8, 48]
  ]);
  // Australia
  drawContinent([
    [113, -22], [143, -16], [151, -33], [115, -34]
  ]);
  // Greenland
  drawContinent([
    [-70, 78], [-25, 78], [-35, 60], [-55, 60]
  ]);
  // Antarctica
  drawContinent([
    [-180, -75], [180, -75], [180, -90], [-180, -90]
  ]);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 2. 3D EARTH COMPONENT
function InteractiveEarth({
  onCoordsSelected,
  selectedCoords
}: {
  onCoordsSelected: (lat: number, lng: number) => void;
  selectedCoords: { lat: number; lng: number } | null;
}) {
  const earthRef = useRef<THREE.Group>(null);

  // Load neon texture dynamically
  const texture = useMemo(() => createProceduralEarthTexture(), []);

  // Compute 3D pin position on sphere of radius 2
  const pinPos = useMemo(() => {
    if (!selectedCoords) return null;
    const r = 2.03; // place slightly above the sphere boundary
    const latRad = (selectedCoords.lat * Math.PI) / 180;
    const lngRad = (selectedCoords.lng * Math.PI) / 180;
    
    // Spherical to Cartesian:
    // x = r * cos(lat) * sin(lng)
    // y = r * sin(lat)
    // z = r * cos(lat) * cos(lng)
    const x = r * Math.cos(latRad) * Math.sin(lngRad);
    const y = r * Math.sin(latRad);
    const z = r * Math.cos(latRad) * Math.cos(lngRad);
    return new THREE.Vector3(x, y, z);
  }, [selectedCoords]);

  const handleGlobeClick = (e: any) => {
    e.stopPropagation();
    if (!e.point || !earthRef.current) return;

    // Find Click in local Earth coordinates (works even after OrbitControls rotation)
    const localPoint = e.point.clone();
    earthRef.current.worldToLocal(localPoint);
    localPoint.normalize();

    // Map local 3D Cartesian coordinates back to spherical lat/lng
    const lat = Math.asin(localPoint.y) * (180 / Math.PI);
    const lng = Math.atan2(localPoint.x, localPoint.z) * (180 / Math.PI);

    onCoordsSelected(lat, lng);
  };

  useFrame(({ clock }) => {
    if (earthRef.current && !pinPos) {
      // Rotate globe slowly in idle mode (only when no active coordinates pin selected)
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={earthRef}>
      {/* Glow highlight */}
      <Sphere args={[2.08, 32, 32]}>
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Main Earth Sphere */}
      <mesh onPointerDown={handleGlobeClick} castShadow receiveShadow>
        <sphereGeometry args={[2, 64, 64]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            roughness={0.7}
            metalness={0.3}
            bumpScale={0.05}
          />
        ) : (
          <meshStandardMaterial
            color="#090d26"
            emissive="#0d1840"
            roughness={0.8}
          />
        )}
      </mesh>

      {/* Orbiting Ring Indicator at selected spot */}
      {pinPos && (
        <group position={pinPos}>
          {/* Active coordinate beacon pin */}
          <mesh>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08, 0.22, 32]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 3. HOTSPOT PRESETS
const OBS_PRESETS = [
  { name: 'Mauna Kea (Hawaii) 🌋', lat: 19.8206, lng: -155.4681, city: 'Mauna Kea', country: 'USA' },
  { name: 'Svalbard Sat Station (Norway) ❄️', lat: 78.2304, lng: 15.3888, city: 'Longyearbyen', country: 'Norway' },
  { name: 'ESO Paranal Observatory (Chile) 🌌', lat: -24.6275, lng: -70.4042, city: 'Paranal Desert', country: 'Chile' },
  { name: 'Kennedy Space Center (KSC) 🚀', lat: 28.5721, lng: -80.6480, city: 'Merritt Island', country: 'USA' },
];

export default function LocationPicker() {
  const { currentLocation, setCurrentLocation } = useLocationStore();
  const [activeMode, setActiveMode] = useState<'globe' | 'map'>('globe');
  
  // Search Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Map 2D Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  // Handle Coordinate Click Selection (Both 3D Globe and 2D Map)
  const handleCoordsChange = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/location?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentLocation(data);
        setSearchQuery(data.city || '');
      } else {
        // Fallback
        setCurrentLocation({
          latitude: lat,
          longitude: lng,
          city: 'Selected Coordinate',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      }
    } catch (err) {
      console.error('Error reverse geocoding clicked point:', err);
    }
  };

  // Geocoding Autocomplete Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Failed to search locations:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Leaflet Map 2D Lifecycle
  useEffect(() => {
    if (activeMode !== 'map' || !mapRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    const initialLat = currentLocation?.latitude || 24;
    const initialLng = currentLocation?.longitude || 12;

    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: 3,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'leaflet-picker-pin',
      html: `<div style="width:16px; height:16px; background:#ef4444; border: 2px solid white; border-radius:50%; box-shadow:0 0 10px #ef4444;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const marker = L.marker([initialLat, initialLng], { icon: customIcon }).addTo(map);
    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Handle clicks on map to set position
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      handleCoordsChange(lat, lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [activeMode]);

  // Synchronize Leaflet marker if coords update from outside (e.g. search or globe)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && currentLocation) {
      const lat = currentLocation.latitude;
      const lng = currentLocation.longitude;
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.panTo([lat, lng]);
    }
  }, [currentLocation]);

  return (
    <GlassCard className="p-5 relative overflow-hidden flex flex-col gap-5 select-none" hover={false}>
      {/* Grid lines background layout */}
      <div className="absolute inset-0 hud-grid opacity-5 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Coordinates Command Center
          </span>
          <h3 className="text-lg font-extrabold text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>
            Target Geolocation Capture
          </h3>
        </div>

        {/* View Switch pill */}
        <div className="flex gap-1 p-0.5 rounded-xl bg-slate-950/80 border border-white/5 w-fit">
          <button
            onClick={() => setActiveMode('globe')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-none ${
              activeMode === 'globe'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🌐 3D Globe
          </button>
          <button
            onClick={() => setActiveMode('map')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-none ${
              activeMode === 'map'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🗺️ 2D Map
          </button>
        </div>
      </div>

      {/* Main selection content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[350px]">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* Autocomplete Input Search */}
          <div className="relative">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">
              Locate City / Station
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type city name (e.g. Hawaii, Svalbard...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors cursor-none"
              />
              {searchLoading && (
                <div className="absolute right-3.5 top-3 w-4 h-4 border border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
              )}
            </div>

            {/* Results Dropdown */}
            <AnimatePresence>
              {showDropdown && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 right-0 mt-1.5 bg-slate-950 border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50 max-h-56 overflow-y-auto"
                >
                  {searchResults.map((r, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentLocation({
                          latitude: r.latitude,
                          longitude: r.longitude,
                          city: r.name,
                          country: r.country,
                          timezone: r.timezone || 'UTC',
                        });
                        setSearchQuery(r.name);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-purple-500/10 border-b border-white/5 last:border-none flex justify-between items-center transition-colors cursor-none"
                    >
                      <span className="text-white font-medium">{r.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {r.country} ({r.latitude.toFixed(2)}°, {r.longitude.toFixed(2)}°)
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active target details read-out */}
          <div className="p-4 rounded-xl bg-slate-950/30 border border-white/5 space-y-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-1">
              Active Coordinates Locked
            </span>
            <div className="grid grid-cols-2 gap-4 font-mono">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">LATITUDE</span>
                <span className="text-xs font-extrabold text-cyan-400">
                  {currentLocation?.latitude.toFixed(4) || '0.0000'}° N
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">LONGITUDE</span>
                <span className="text-xs font-extrabold text-cyan-400">
                  {currentLocation?.longitude.toFixed(4) || '0.0000'}° E
                </span>
              </div>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono block uppercase">TARGET PLACE</span>
              <span className="text-xs font-semibold text-slate-200">
                {currentLocation?.city ? `${currentLocation.city}, ` : ''}
                {currentLocation?.country || 'Unknown Location'}
              </span>
            </div>
          </div>

          {/* Shortcuts panel */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
              Observatory Preset Nodes
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OBS_PRESETS.map((p) => {
                const isActive =
                  currentLocation &&
                  Math.abs(currentLocation.latitude - p.lat) < 0.05 &&
                  Math.abs(currentLocation.longitude - p.lng) < 0.05;

                return (
                  <button
                    key={p.name}
                    onClick={() => {
                      setCurrentLocation({
                        latitude: p.lat,
                        longitude: p.lng,
                        city: p.city,
                        country: p.country,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                      });
                      setSearchQuery(p.city);
                    }}
                    className={`text-[10px] p-2.5 rounded-xl border text-left transition-all cursor-none ${
                      isActive
                        ? 'bg-purple-500/20 border-purple-500/40 text-white font-bold'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Globe / Map Visualizer Canvas Container */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-white/10 bg-[#02000a] min-h-[300px] max-h-[450px] relative">
          
          <AnimatePresence mode="wait">
            {activeMode === 'globe' ? (
              <motion.div
                key="3d-globe"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                <div className="absolute top-3 left-3 z-10 font-mono text-[9px] text-slate-400 uppercase bg-black/60 px-2 py-1 rounded">
                  🖱️ Drag to rotate · Tap to lock coordinates
                </div>
                <Canvas
                  camera={{ position: [0, 0, 4.5], fov: 60 }}
                  gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                  style={{ background: 'transparent' }}
                >
                  <ambientLight intensity={0.25} />
                  <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
                  <pointLight position={[-5, -3, -5]} intensity={0.5} color="#7c3aed" />

                  <InteractiveEarth
                    onCoordsSelected={handleCoordsChange}
                    selectedCoords={
                      currentLocation
                        ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
                        : null
                    }
                  />

                  <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    dampingFactor={0.05}
                    rotateSpeed={0.8}
                  />
                </Canvas>
              </motion.div>
            ) : (
              <motion.div
                key="2d-map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full min-h-[350px]"
              >
                <div ref={mapRef} className="w-full h-full min-h-[350px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </GlassCard>
  );
}
