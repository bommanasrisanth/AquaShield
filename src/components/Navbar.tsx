/**
 * FloodGuard Emergency Navigation Header — Clean Aesthetic Edition
 * Human-crafted white aesthetic, intuitive controls, instant city switcher, and accessible typography.
 */

import React from 'react';
import { LanguageCode, LocationCoordinates, OperatingMode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { clearAllLocalData } from '../offline/db';

interface NavbarProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentLocation: LocationCoordinates;
  onLocationChange: (loc: LocationCoordinates) => void;
  operatingMode: OperatingMode;
  onToggleSimulateOffline: () => void;
  isSimulatingOffline: boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isPackInstalled: boolean;
  onOpenOfflinePackModal: () => void;
}

export const PRESET_LOCATIONS: LocationCoordinates[] = [
  {
    name: 'Vijayawada',
    country: 'India',
    latitude: 16.5062,
    longitude: 80.648,
    elevationMeters: 22,
    riverBasin: 'Krishna River Basin',
  },
  {
    name: 'Kathmandu',
    country: 'Nepal',
    latitude: 27.7172,
    longitude: 85.324,
    elevationMeters: 1320,
    riverBasin: 'Bagmati River Basin',
  },
  {
    name: 'Dhaka',
    country: 'Bangladesh',
    latitude: 23.8103,
    longitude: 90.4125,
    elevationMeters: 12,
    riverBasin: 'Buriganga / Meghna Delta',
  },
  {
    name: 'Houston',
    country: 'USA',
    latitude: 29.7604,
    longitude: -95.3698,
    elevationMeters: 15,
    riverBasin: 'Buffalo Bayou / Gulf Coast',
  },
  {
    name: 'Nairobi',
    country: 'Kenya',
    latitude: -1.2921,
    longitude: 36.8219,
    elevationMeters: 1675,
    riverBasin: 'Nairobi River Basin',
  },
];

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  ne: 'नेपाली',
  bn: 'বাংলা',
  es: 'Español',
  fr: 'Français',
  ar: 'العربية (RTL)',
  pt: 'Português',
  id: 'Bahasa Indonesia',
  sw: 'Kiswahili',
};

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  currentLocation,
  onLocationChange,
  operatingMode,
  onToggleSimulateOffline,
  isSimulatingOffline,
  activeTab,
  onSelectTab,
  isPackInstalled,
  onOpenOfflinePackModal,
}) => {
  const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const handleGPSDetect = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onLocationChange({
            name: 'My GPS Location',
            country: 'Local',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            elevationMeters: pos.coords.altitude ? Math.round(pos.coords.altitude) : 20,
          });
        },
        (err) => {
          alert(`GPS detection error: ${err.message}. Using ${currentLocation.name}.`);
        },
        { timeout: 7000 }
      );
    }
  };

  const handleDeleteData = async () => {
    if (confirm('Clear all locally saved AquaShield emergency contacts, offline reports, and cache?')) {
      await clearAllLocalData();
      alert('Local data cleared.');
      window.location.reload();
    }
  };

  return (
    <header className="w-full bg-white/90 border-b border-stone-200/80 sticky top-0 z-40 backdrop-blur-md shadow-[0_2px_8px_rgba(45,36,27,0.02)]">
      {/* Top Essential Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onSelectTab('DASHBOARD')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-xl shadow-md shadow-blue-500/20 text-white transition group-hover:scale-105">
            🌊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-stone-900 tracking-tight">AQUASHIELD</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-full">
                Offline Life-Saving
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block font-medium">
              Global Flood Intelligence & Humanitarian Response
            </p>
          </div>
        </div>

        {/* Location & Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Location Selector */}
          <div className="flex items-center bg-stone-100/80 hover:bg-stone-100 rounded-2xl border border-stone-200/80 px-3 py-1.5 text-xs transition shadow-xs">
            <span className="mr-1.5 text-stone-500">📍</span>
            <select
              value={currentLocation.name}
              onChange={(e) => {
                const found = PRESET_LOCATIONS.find((l) => l.name === e.target.value);
                if (found) onLocationChange(found);
              }}
              aria-label="Select Testing Location"
              className="bg-transparent text-stone-800 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name} className="bg-white text-stone-800">
                  {loc.name} ({loc.country})
                </option>
              ))}
              {currentLocation.name === 'My GPS Location' && (
                <option value="My GPS Location" className="bg-white text-stone-800">
                  My GPS Location
                </option>
              )}
            </select>
            <button
              onClick={handleGPSDetect}
              title="Detect Device GPS"
              className="ml-2 pl-2 border-l border-stone-300 text-[11px] text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
            >
              GPS
            </button>
          </div>

          {/* 12-Language Switcher */}
          <div className="flex items-center bg-stone-100/80 hover:bg-stone-100 rounded-2xl border border-stone-200/80 px-3 py-1.5 text-xs transition shadow-xs">
            <span className="mr-1.5 text-stone-500">🌐</span>
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              aria-label="Select Language"
              className="bg-transparent text-stone-800 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                <option key={code} value={code} className="bg-white text-stone-800">
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Offline Mode Toggle Button */}
          <button
            onClick={onToggleSimulateOffline}
            title="Toggle Mode C Offline Simulation"
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isSimulatingOffline
                ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/80'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isSimulatingOffline ? 'bg-white animate-ping' : 'bg-emerald-500'}`}></span>
            <span>{isSimulatingOffline ? 'Mode C (Offline)' : 'Mode A (Online)'}</span>
          </button>

          {/* Offline Pack Status Button */}
          <button
            onClick={onOpenOfflinePackModal}
            title={isPackInstalled ? 'Offline Pack Installed' : 'Download Offline Emergency Pack'}
            className="px-3.5 py-1.5 rounded-2xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200/80 text-xs font-semibold text-stone-700 cursor-pointer transition shadow-xs flex items-center gap-1.5"
          >
            <span>{isPackInstalled ? '📦' : '📥'}</span>
            <span className="hidden sm:inline">{isPackInstalled ? 'Pack Ready' : 'Download Pack'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar — Warm Rounded Segmented Control */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 pt-1 overflow-x-auto no-scrollbar flex items-center gap-2 text-xs">
        {[
          { id: 'DASHBOARD', label: dict.navDashboard, icon: '📊' },
          { id: 'COMPANION', label: dict.navCompanion, icon: '🤖' },
          { id: 'SAFEPLACE', label: dict.navSafePlace, icon: '🛡️' },
          { id: 'FAMILY', label: dict.navFamily, icon: '👨‍👩‍👦' },
          { id: 'SENSORS', label: dict.navSensors, icon: '📟' },
          { id: 'READINESS', label: dict.navReadiness, icon: '🎒' },
          { id: 'AUTHORITIES', label: dict.navAuthorities, icon: '🏛️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`py-2 px-3.5 whitespace-nowrap font-bold rounded-2xl flex items-center gap-2 transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'bg-stone-100/80 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}

        <button
          onClick={handleDeleteData}
          title="Privacy: Delete all local stored data"
          className="ml-auto text-[11px] font-medium text-stone-400 hover:text-rose-600 py-1.5 px-2.5 whitespace-nowrap cursor-pointer rounded-xl hover:bg-rose-50 transition"
        >
          🗑️ Clear My Data
        </button>
      </div>
    </header>
  );
};
