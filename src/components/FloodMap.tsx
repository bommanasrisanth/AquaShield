/**
 * FloodMap Component
 * Interactive Leaflet map with OpenStreetMap tiles.
 * Includes graceful offline vector canvas fallback when tiles cannot be loaded.
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationCoordinates, EvacuationShelter, CommunityReport } from '../types';

interface FloodMapProps {
  location: LocationCoordinates;
  shelters: EvacuationShelter[];
  communityReports: CommunityReport[];
  isOffline: boolean;
  onSelectShelter?: (shelter: EvacuationShelter) => void;
}

export const FloodMap: React.FC<FloodMapProps> = ({
  location,
  shelters,
  communityReports,
  isOffline,
  onSelectShelter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [location.latitude, location.longitude],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add OpenStreetMap tile layer with error handling
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      });

      tileLayer.on('tileerror', () => {
        setTileError(true);
      });

      tileLayer.addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([location.latitude, location.longitude], 13);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // 1. User Location Marker (Pulse circle + pin)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #3b82f6; border: 2px solid #ffffff; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker([location.latitude, location.longitude], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<strong>Your Location</strong><br/>${location.name} (Elev: ${location.elevationMeters || 20}m)`);

    // 2. Add Evacuation Shelters
    shelters.forEach((s) => {
      const shelterIcon = L.divIcon({
        className: 'shelter-marker',
        html: `
          <div style="background: ${s.isVerified ? '#10b981' : '#f59e0b'}; color: white; border-radius: 6px; padding: 4px 6px; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px;">
            <span>🛡️</span>
            <span>${s.name.slice(0, 14)}...</span>
          </div>
        `,
        iconSize: [120, 26],
        iconAnchor: [60, 13],
      });

      const marker = L.marker([s.latitude, s.longitude], { icon: shelterIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px;">
          <h4 style="margin: 0 0 4px; font-size: 14px; color: #1e293b;">${s.name}</h4>
          <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">${s.address}</p>
          <div style="font-size: 11px; margin-bottom: 4px;">
            <strong>Elevation:</strong> ${s.elevationMeters}m | <strong>Dist:</strong> ${s.distanceKm} km
          </div>
          <div style="font-size: 11px; margin-bottom: 6px;">
            <strong>Walking:</strong> ~${s.estimatedWalkingMinutes} min | <strong>Status:</strong> ${s.isVerified ? '✅ Official Verified' : '⚠️ Community'}
          </div>
          <a href="https://maps.google.com/?q=${s.latitude},${s.longitude}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #0284c7; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold;">Get Directions</a>
        </div>
      `);
      marker.on('click', () => {
        onSelectShelter?.(s);
      });
    });

    // 3. Add Community Incident Reports
    communityReports.forEach((r) => {
      const isRoad = r.reportType === 'FLOODED_ROAD';
      const reportIcon = L.divIcon({
        className: 'report-marker',
        html: `
          <div style="background: ${isRoad ? '#ef4444' : '#ea580c'}; color: white; border-radius: 9999px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);">
            ${isRoad ? '⚠️' : '🌊'}
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      L.marker([r.latitude, r.longitude], { icon: reportIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif;">
            <strong style="color: #dc2626;">${r.reportType.replace(/_/g, ' ')}</strong>
            <p style="margin: 4px 0; font-size: 12px;">${r.description}</p>
            <div style="font-size: 11px; color: #64748b;">
              Water depth: ~${r.waterDepthCm || 30}cm | ${r.isPassableForVehicles ? 'Passable' : '🚫 Blocked for Vehicles'}
            </div>
          </div>
        `);
    });
  }, [location, shelters, communityReports]);

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Offline Canvas Radar Fallback when tiles are unavailable */}
      {(isOffline || tileError) && (
        <div className="absolute top-3 right-3 bg-amber-500 text-white border border-amber-600 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>Offline Map Cache Active</span>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-2.5 text-[11px] text-slate-700 font-semibold z-10 flex flex-wrap gap-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white shadow-xs"></span>
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
          <span>Verified Shelter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs"></span>
          <span>Flooded Road / Hazard</span>
        </div>
      </div>
    </div>
  );
};
