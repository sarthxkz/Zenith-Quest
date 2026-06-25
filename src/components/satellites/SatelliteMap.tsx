'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Satellite } from '@/lib/types/satellite';

import { useLocationStore } from '@/lib/store/locationStore';

interface SatelliteMapProps {
  satellites: Satellite[];
  onSatelliteSelect?: (satellite: Satellite) => void;
}

const SATELLITE_ICONS: Record<string, string> = {
  iss: '🚀',
  starlink: '⭐',
  scientific: '🔭',
  weather: '🌤️',
  communication: '📡',
  other: '🛰️',
};

export default function SatelliteMap({ satellites, onSatelliteSelect }: SatelliteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize custom Dark Leaflet container
    const map = L.map(mapRef.current, {
      center: [24, 12],
      zoom: 3,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark Map tiles from CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    // Map click handler to capture coordinate
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      try {
        const res = await fetch(`/api/location?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`);
        if (res.ok) {
          const data = await res.json();
          useLocationStore.getState().setCurrentLocation(data);
        } else {
          useLocationStore.getState().setCurrentLocation({
            latitude: lat,
            longitude: lng,
            city: 'Custom Coordinates',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        }
      } catch (err) {
        console.error('Map click location capture error:', err);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing marker/orbit layers
    layersRef.current.forEach((layer) => layer.remove());
    layersRef.current = [];

    // Add observer location marker if available
    const curLoc = useLocationStore.getState().currentLocation;
    if (curLoc) {
      const observerIcon = L.divIcon({
        className: 'observer-location-pin',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              inset: -6px;
              border-radius: 50%;
              border: 1px solid #a78bfa;
              animation: observer-pulse 2s infinite linear;
              pointer-events: none;
            "></div>
            <div style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #7c3aed;
              border: 2px solid white;
              box-shadow: 0 0 10px #7c3aed;
            "></div>
          </div>
          <style>
            @keyframes observer-pulse {
              0% { transform: scale(0.8); opacity: 0.8; }
              100% { transform: scale(2.0); opacity: 0; }
            }
          </style>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const observerMarker = L.marker([curLoc.latitude, curLoc.longitude], { icon: observerIcon })
        .addTo(map)
        .bindPopup(`
          <div style="
            background: rgba(7, 11, 36, 0.85);
            backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(124, 58, 237, 0.3);
            border-radius: 12px;
            padding: 8px 12px;
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            text-align: center;
          ">
            <div style="font-weight: bold; color: #a78bfa;">📡 OBSERVER NODE LOCK</div>
            <div>${curLoc.city || 'Custom Coordinates'}</div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">${curLoc.latitude.toFixed(4)}°, ${curLoc.longitude.toFixed(4)}°</div>
          </div>
        `, { className: 'custom-popup', closeButton: false, offset: [0, -6] });
      
      layersRef.current.push(observerMarker);
    }

    // Add orbit polylines and active marker nodes for each satellite
    satellites.forEach((sat) => {
      const isISS = sat.type === 'iss';
      const colorCore = isISS ? '#06b6d4' : '#7c3aed';
      const colorGlow = isISS ? '#22d3ee' : '#a78bfa';

      // 1. GENERATE Inclined Orbital Path Array
      const pathPoints: [number, number][] = [];
      const inclination = Math.max(20, Math.min(68, Math.abs(sat.latitude) || 48)); // Orbit inclination estimate
      const phaseShift = sat.longitude;

      for (let angle = 0; angle <= 360; angle += 3) {
        const angleRad = (angle * Math.PI) / 180;
        const currentLng = ((phaseShift + angle + 180) % 360) - 180;
        const currentLat = Math.sin(angleRad) * inclination;
        pathPoints.push([currentLat, currentLng]);
      }

      // 2. Add Orbit Polyline layers (thick glow and thin dashed active line)
      const glowPolyline = L.polyline(pathPoints, {
        color: colorCore,
        weight: 5,
        opacity: 0.08,
      }).addTo(map);
      layersRef.current.push(glowPolyline);

      const activePolyline = L.polyline(pathPoints, {
        color: colorGlow,
        weight: 1.2,
        opacity: 0.32,
        dashArray: '6, 12',
      }).addTo(map);
      layersRef.current.push(activePolyline);

      // 3. Add Custom Radar-Pulse Div Icon
      const icon = L.divIcon({
        className: 'satellite-marker-node',
        html: `
          <div style="position: relative; width: 34px; height: 34px;">
            <!-- Outer radar pulse rings -->
            <div style="
              position: absolute;
              inset: -8px;
              border-radius: 50%;
              border: 1px solid ${colorCore};
              animation: radar-pulse 3s infinite linear;
              pointer-events: none;
            "></div>
            <div style="
              position: absolute;
              inset: -14px;
              border-radius: 50%;
              border: 1px solid ${colorCore};
              animation: radar-pulse 3s infinite linear;
              animation-delay: 1.5s;
              pointer-events: none;
            "></div>
            
            <!-- Core Sat marker container -->
            <div style="
              position: absolute;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 34px;
              height: 34px;
              border-radius: 50%;
              background: rgba(7, 11, 36, 0.8);
              backdrop-filter: blur(8px);
              border: 2px solid ${colorGlow};
              font-size: 16px;
              box-shadow: 0 0 12px ${isISS ? 'rgba(34, 211, 238, 0.4)' : 'rgba(167, 139, 250, 0.4)'};
              cursor: pointer;
              z-index: 10;
            ">
              ${SATELLITE_ICONS[sat.type] || '🛰️'}
            </div>
          </div>
          <style>
            @keyframes radar-pulse {
              0% { transform: scale(0.6); opacity: 0.8; }
              100% { transform: scale(2.0); opacity: 0; }
            }
          </style>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      // 4. Mount Marker overlay
      const marker = L.marker([sat.latitude, sat.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="
            background: rgba(7, 11, 36, 0.85);
            backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(167, 139, 250, 0.3);
            border-radius: 12px;
            padding: 14px 18px;
            color: white;
            font-family: 'Inter', sans-serif;
            min-width: 200px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
          ">
            <div style="font-size: 14px; font-weight: 800; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px; tracking-wide">${sat.name}</div>
            <div style="font-size: 11px; color: #94a3b8; line-height: 1.8; font-family: monospace;">
              <div>⚡ ALTITUDE: <span style="color: #fff; font-weight: bold;">${sat.altitude.toFixed(1)} km</span></div>
              <div>🧭 LATITUDE: <span style="color: #fff;">${sat.latitude.toFixed(4)}°</span></div>
              <div>🧭 LONGITUDE: <span style="color: #fff;">${sat.longitude.toFixed(4)}°</span></div>
              <div>🤖 TYPE: <span style="color: #a78bfa; text-transform: uppercase; font-weight: bold;">${sat.type}</span></div>
              ${sat.isVisible 
                ? '<div style="color: #10b981; font-weight: bold; margin-top: 6px; display: flex; align-items: center; gap: 4px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block;"></span> OVERHEAD SWEEP ACTIVE</div>' 
                : '<div style="color: #ef4444; font-weight: bold; margin-top: 6px; display: flex; align-items: center; gap: 4px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #ef4444; display: inline-block;"></span> SWEEP OUT OF RANGE</div>'}
            </div>
          </div>
        `, {
          className: 'custom-popup',
          closeButton: false,
          offset: [0, -10]
        });

      marker.on('click', () => {
        onSatelliteSelect?.(sat);
      });

      layersRef.current.push(marker);
    });
  }, [satellites, onSatelliteSelect]);

  return (
    <div ref={mapRef} className="w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative" style={{ background: '#030014' }}>
      {/* Corner borders over the map */}
      <div className="hud-corner hud-corner-tl !z-[1000]" />
      <div className="hud-corner hud-corner-tr !z-[1000]" />
      <div className="hud-corner hud-corner-bl !z-[1000]" />
      <div className="hud-corner hud-corner-br !z-[1000]" />
    </div>
  );
}
