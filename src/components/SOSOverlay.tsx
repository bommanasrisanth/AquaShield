/**
 * SOS Emergency Fullscreen Overlay
 * Features:
 * - Dual-tone piercing synthesized audio siren
 * - Visual high-contrast strobe (with toggle)
 * - One-tap direct call to emergency services
 * - Offline SOS SMS generator with GPS coordinates
 */

import React, { useEffect, useState } from 'react';
import { siren } from '../alerts/audioSiren';
import { triggerEmergencyVibration, stopEmergencyVibration } from '../alerts/vibration';
import { buildOfflineSMSUrl } from '../communication/familyNetwork';
import { EmergencyContact, LocationCoordinates } from '../types';

interface SOSOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
  primaryContact?: EmergencyContact;
  emergencyNumber: string;
}

export const SOSOverlay: React.FC<SOSOverlayProps> = ({
  isOpen,
  onClose,
  location,
  primaryContact,
  emergencyNumber,
}) => {
  const [strobeEnabled, setStrobeEnabled] = useState(true);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [sirenActive, setSirenActive] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      siren.stopSiren();
      stopEmergencyVibration();
      return;
    }

    if (sirenActive) {
      siren.startSiren(0.9);
      triggerEmergencyVibration([600, 200, 600, 200, 1000]);
    }

    let strobeTimer: any = null;
    if (strobeEnabled) {
      strobeTimer = setInterval(() => {
        setIsStrobeActive((prev) => !prev);
      }, 400);
    }

    return () => {
      siren.stopSiren();
      stopEmergencyVibration();
      if (strobeTimer) clearInterval(strobeTimer);
    };
  }, [isOpen, strobeEnabled, sirenActive]);

  if (!isOpen) return null;

  const smsUrl = buildOfflineSMSUrl(
    primaryContact?.phone || '',
    'NEED_HELP',
    location.latitude,
    location.longitude,
    location.name,
    'I AM TRAPPED BY FLOODWATER. PLEASE DISPATCH RESCUE TO MY EXACT COORDINATES.'
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SOS Emergency Mode"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 transition-colors duration-200 ${
        strobeEnabled && isStrobeActive ? 'bg-red-700 text-white' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping"></span>
          <h1 className="text-xl font-black tracking-wider uppercase">SOS EMERGENCY ACTIVE</h1>
        </div>
        <button
          onClick={() => {
            siren.stopSiren();
            stopEmergencyVibration();
            onClose();
          }}
          className="bg-slate-800/80 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-bold border border-slate-600 cursor-pointer"
        >
          ✕ Exit SOS
        </button>
      </div>

      {/* Main Alert Center */}
      <div className="w-full max-w-md text-center my-auto flex flex-col items-center space-y-5">
        <div className="w-24 h-24 rounded-full bg-red-600/30 border-4 border-red-500 flex items-center justify-center animate-pulse">
          <span className="text-4xl">🚨</span>
        </div>

        <div>
          <h2 className="text-2xl font-black text-red-400">EMERGENCY ASSISTANCE</h2>
          <p className="text-sm mt-1 text-slate-300 max-w-xs mx-auto">
            Your location: <span className="font-semibold text-white">{location.name}</span> (
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
          </p>
        </div>

        {/* Action Call & SMS buttons */}
        <div className="w-full space-y-3 pt-2">
          <a
            href={`tel:${emergencyNumber}`}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-red-600 hover:bg-red-500 active:scale-98 text-white rounded-xl text-lg font-black tracking-wide shadow-lg border-2 border-red-400 cursor-pointer"
          >
            <span>📞</span>
            <span>CALL EMERGENCY ({emergencyNumber})</span>
          </a>

          <a
            href={smsUrl}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-amber-600 hover:bg-amber-500 active:scale-98 text-white rounded-xl text-base font-bold shadow-md border border-amber-400 cursor-pointer"
          >
            <span>💬</span>
            <span>SEND OFFLINE SOS SMS</span>
          </a>
        </div>

        {/* Controls: Siren & Strobe */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => {
              if (sirenActive) {
                siren.stopSiren();
                stopEmergencyVibration();
                setSirenActive(false);
              } else {
                siren.startSiren(0.9);
                setSirenActive(true);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
              sirenActive
                ? 'bg-red-800/70 border-red-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {sirenActive ? '🔊 Siren: ON' : '🔈 Siren: MUTED'}
          </button>

          <button
            onClick={() => setStrobeEnabled(!strobeEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
              strobeEnabled
                ? 'bg-amber-800/70 border-amber-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {strobeEnabled ? '⚡ Strobe: ON' : '🔦 Strobe: OFF'}
          </button>
        </div>
      </div>

      {/* Safety Bottom Notice */}
      <p className="text-xs text-slate-400 text-center max-w-sm">
        Do not walk or drive into moving water. Signal rescuers with your flashlight and whistle.
      </p>
    </div>
  );
};
