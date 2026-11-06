/**
 * Smart SafePlace Evacuation System — Aesthetic White Edition
 * Clean, readable, life-saving shelter intelligence with road travel times and elevation safety.
 */

import React, { useState } from 'react';
import { EvacuationShelter, LocationCoordinates } from '../types';

interface SmartSafePlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
  shelters: EvacuationShelter[];
}

export const SmartSafePlaceModal: React.FC<SmartSafePlaceModalProps> = ({
  isOpen,
  onClose,
  location,
  shelters,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  if (!isOpen) return null;

  const filtered = shelters.filter((s) => {
    if (filterType === 'VERIFIED') return s.isVerified;
    if (filterType === 'HOSPITAL') return s.type === 'HOSPITAL';
    if (filterType === 'OFFICIAL') return s.type === 'OFFICIAL_SHELTER';
    return true;
  });

  const userElevation = location.elevationMeters || 20;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Smart SafePlace Evacuation Shelters"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl h-[88vh] max-h-[720px] bg-white border border-slate-200/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🛡️</span>
              <h2 className="font-extrabold text-slate-900 text-lg">Smart SafePlace Evacuation</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your ground elevation: <strong className="text-slate-800">{userElevation}m</strong>.
              Showing verified high-ground relief centers and hospitals.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Filter Pills */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex gap-2 overflow-x-auto text-xs no-scrollbar">
          {[
            { id: 'ALL', label: 'All Shelters' },
            { id: 'VERIFIED', label: '✅ Official Verified Only' },
            { id: 'OFFICIAL', label: '🏛️ Cyclone & Flood Centers' },
            { id: 'HOSPITAL', label: '🏥 Hospitals & Trauma' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer text-xs shadow-xs ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Shelter List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fafbfc]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No shelters match the selected filter.</p>
            </div>
          ) : (
            filtered.map((shelter) => {
              const elevDiff = shelter.elevationMeters - userElevation;
              const isHigher = elevDiff > 0;

              return (
                <div
                  key={shelter.id}
                  className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 transition shadow-xs hover:shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900">{shelter.name}</h3>
                        {shelter.isVerified ? (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            COMMUNITY REPORTED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{shelter.address}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-blue-600">{shelter.distanceKm} km</div>
                      <div className="text-[10px] text-slate-400 font-medium">via road</div>
                    </div>
                  </div>

                  {/* Metrics Badges: Elevation, Times, Capacity */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] font-medium uppercase">Elevation</span>
                      <span className="font-bold text-slate-800">
                        {shelter.elevationMeters}m ({isHigher ? `+${elevDiff}m higher` : `${elevDiff}m`})
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] font-medium uppercase">Walking Time</span>
                      <span className="font-bold text-slate-800">
                        ~{shelter.estimatedWalkingMinutes} min
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] font-medium uppercase">Vehicle Time</span>
                      <span className="font-bold text-slate-800">
                        ~{shelter.estimatedDrivingMinutes} min
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] font-medium uppercase">Occupancy</span>
                      <span className="font-bold text-slate-800">
                        {shelter.currentOccupancy} / {shelter.capacity}
                      </span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {shelter.hasMedicalSupport && <span className="font-medium">🩺 Medical Support</span>}
                    {shelter.hasCleanWater && <span className="font-medium">💧 Clean Water</span>}
                    {shelter.verifiedBy && (
                      <span className="truncate max-w-[200px]" title={shelter.verifiedBy}>
                        🏛️ {shelter.verifiedBy}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    {shelter.contactPhone ? (
                      <a
                        href={`tel:${shelter.contactPhone}`}
                        className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-bold"
                      >
                        <span>📞</span>
                        <span>{shelter.contactPhone}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No public desk phone</span>
                    )}

                    <a
                      href={`https://maps.google.com/?q=${shelter.latitude},${shelter.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>🧭</span>
                      <span>Navigate Directions</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Safety Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center font-medium">
          Notice: Never cross moving water to reach a shelter. If roads are submerged, seek high ground immediately.
        </div>
      </div>
    </div>
  );
};
