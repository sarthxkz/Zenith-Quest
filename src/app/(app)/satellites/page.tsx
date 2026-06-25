'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import GlassCard from '@/components/shared/GlassCard';
import { mockSatellites, mockSatellitePasses } from '@/lib/mock/mockSatellites';
import { formatTime } from '@/lib/utils/formatters';
import type { Satellite } from '@/lib/types/satellite';

const SatelliteMap = dynamic(() => import('@/components/satellites/SatelliteMap'), { ssr: false });

import { useLocationStore } from '@/lib/store/locationStore';

export default function SatellitesPage() {
  const { currentLocation } = useLocationStore();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [satellitesList, setSatellitesList] = useState<Satellite[]>([]);
  const [issPassesList, setIssPassesList] = useState<SatellitePass[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Micro-fluctuation state for the speed ticker to simulate live telemetry streams
  const [tickerOffset, setTickerOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerOffset((Math.random() - 0.5) * 0.04);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentLocation) return;

    const fetchSats = async () => {
      try {
        const lat = currentLocation.latitude;
        const lng = currentLocation.longitude;
        const res = await fetch(`/api/satellites?lat=${lat}&lng=${lng}&type=${selectedType}`);
        if (res.ok) {
          const data = await res.json();
          setSatellitesList(data.satellites || []);
          setIssPassesList(data.issPasses || []);
        }
      } catch (err) {
        console.error('Error fetching live satellite telemetry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSats();
    const interval = setInterval(fetchSats, 5000);
    return () => clearInterval(interval);
  }, [currentLocation, selectedType]);

  // Keep selected satellite reference synced with the live data list
  const liveSelectedSatellite = selectedSatellite
    ? satellitesList.find((s) => s.id === selectedSatellite.id) || selectedSatellite
    : null;

  return (
    <div className="p-6 lg:p-8 h-[calc(100vh)]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Satellite Tracker
        </h1>
        <p className="text-slate-400">
          Real-time satellite sweeps above{' '}
          <span className="text-purple-400 font-bold font-mono">
            {currentLocation?.city || 'Detecting Location...'}
          </span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-160px)]">
        {/* Map */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-purple-500/10">
          <SatelliteMap
            satellites={satellitesList}
            onSatelliteSelect={setSelectedSatellite}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4 overflow-y-auto">
          {/* Filters */}
          <GlassCard hover={false}>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Filter</h3>
            <div className="flex flex-wrap gap-2">
              {['all', 'iss', 'starlink', 'scientific', 'weather'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all capitalize cursor-none ${
                    selectedType === type
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {type === 'iss' ? 'ISS' : type}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Selected satellite info / Speed Tracker */}
          {liveSelectedSatellite && (
            <GlassCard className="relative overflow-hidden group">
              <div className="hud-corner hud-corner-tl" />
              <div className="hud-corner hud-corner-tr" />
              <div className="hud-corner hud-corner-bl" />
              <div className="hud-corner hud-corner-br" />
              <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none" />

              <h3 className="text-sm font-extrabold text-white mb-3 tracking-wide flex items-center justify-between border-b border-white/5 pb-2">
                <span>🛰️ {liveSelectedSatellite.name}</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                  Active
                </span>
              </h3>

              <div className="space-y-3 font-mono text-xs">
                {/* Speed Ticker */}
                <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/10 space-y-1">
                  <span className="text-[9px] text-cyan-400 uppercase font-semibold">Live Velocity Tracker</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-lg font-black text-white leading-none">
                      {Math.round(((liveSelectedSatellite.velocity || 7.66) + tickerOffset) * 3600).toLocaleString()}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">km/h</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold">
                      {((liveSelectedSatellite.velocity || 7.66) + tickerOffset).toFixed(3)} km/s
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-500">Altitude</span>
                    <span className="text-white font-bold">{liveSelectedSatellite.altitude.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-500">Azimuth</span>
                    <span className="text-white font-bold">{liveSelectedSatellite.azimuth.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-500">Elevation</span>
                    <span className="text-white font-bold">{liveSelectedSatellite.elevation.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-500">Latitude</span>
                    <span className="text-white">{liveSelectedSatellite.latitude.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-500">Longitude</span>
                    <span className="text-white">{liveSelectedSatellite.longitude.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type</span>
                    <span className="text-purple-400 capitalize font-bold">{liveSelectedSatellite.type}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Upcoming passes */}
          <GlassCard hover={false}>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Upcoming Passes</h3>
            <div className="space-y-2">
              {issPassesList.slice(0, 4).map((pass, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors cursor-none"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{pass.satellite}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{formatTime(pass.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>Max: {pass.maxElevation}°</span>
                    <span>·</span>
                    <span>Mag: {pass.magnitude}</span>
                    <span>·</span>
                    <span>{Math.round(pass.duration / 60)}m</span>
                  </div>
                </motion.div>
              ))}
              {issPassesList.length === 0 && (
                <div className="text-center py-6 text-xs font-mono text-slate-500">
                  No upcoming sweeps tonight
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
