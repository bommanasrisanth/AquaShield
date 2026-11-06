/**
 * Simple Citizen Dashboard — Human-Made Aesthetic White Edition
 * Designed for immediate cognitive clarity, accessible warmth, and effortless handling.
 */

import React, { useState, useEffect } from 'react';
import {
  FloodStatusLevel,
  RiskAssessment,
  LocationCoordinates,
  EvacuationShelter,
  CommunityReport,
  LanguageCode,
} from '../types';
import { TRANSLATIONS, getSpokenAlertText } from '../i18n/translations';
import { speech } from '../alerts/speechVoice';
import { FloodMap } from './FloodMap';
import { buildOfflineSMSUrl } from '../communication/familyNetwork';
import { PRESET_LOCATIONS } from './Navbar';

interface CitizenDashboardProps {
  status: FloodStatusLevel;
  riskAssessment: RiskAssessment;
  location: LocationCoordinates;
  onLocationChange?: (loc: LocationCoordinates) => void;
  shelters: EvacuationShelter[];
  communityReports: CommunityReport[];
  language: LanguageCode;
  isOffline: boolean;
  onOpenSOS: () => void;
  onOpenHelpline: () => void;
  onOpenSafePlace: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  status,
  riskAssessment,
  location,
  onLocationChange,
  shelters,
  communityReports,
  language,
  isOffline,
  onOpenSOS,
  onOpenHelpline,
  onOpenSafePlace,
}) => {
  const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeCaption, setActiveCaption] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    const unsub = speech.subscribe((state) => {
      setIsSpeaking(state.isSpeaking);
      setActiveCaption(state.currentCaption);
      setVoiceSupported(state.hasVoiceForLanguage);
      setSpeechRate(state.rate);
    });
    return () => unsub();
  }, []);

  // Aesthetic Warm Themes for each Status
  const STATUS_THEMES: Record<
    FloodStatusLevel,
    {
      cardBg: string;
      cardBorder: string;
      badgeBg: string;
      badgeText: string;
      subText: string;
      bulletColor: string;
      icon: string;
    }
  > = {
    SAFE: {
      cardBg: 'bg-white',
      cardBorder: 'border-emerald-200/80 shadow-[0_6px_24px_rgba(16,185,129,0.06)]',
      badgeBg: 'bg-emerald-600 text-white',
      badgeText: 'text-emerald-800 bg-emerald-50/90 border border-emerald-200/70',
      subText: 'text-stone-600',
      bulletColor: 'text-emerald-600',
      icon: '🛡️',
    },
    WATCH: {
      cardBg: 'bg-white',
      cardBorder: 'border-amber-200/80 shadow-[0_6px_24px_rgba(217,119,6,0.06)]',
      badgeBg: 'bg-amber-500 text-white',
      badgeText: 'text-amber-800 bg-amber-50/90 border border-amber-200/80',
      subText: 'text-stone-600',
      bulletColor: 'text-amber-600',
      icon: '👁️',
    },
    PREPARE: {
      cardBg: 'bg-white',
      cardBorder: 'border-orange-200/80 shadow-[0_6px_24px_rgba(234,88,12,0.07)]',
      badgeBg: 'bg-orange-500 text-white',
      badgeText: 'text-orange-800 bg-orange-50/90 border border-orange-200/80',
      subText: 'text-stone-600',
      bulletColor: 'text-orange-600',
      icon: '🎒',
    },
    'LEAVE NOW': {
      cardBg: 'bg-white',
      cardBorder: 'border-rose-300 shadow-[0_8px_32px_rgba(225,29,72,0.1)]',
      badgeBg: 'bg-rose-600 text-white shadow-md shadow-rose-500/20',
      badgeText: 'text-rose-800 bg-rose-50/90 border border-rose-200/80',
      subText: 'text-stone-700',
      bulletColor: 'text-rose-600',
      icon: '🚨',
    },
  };

  const theme = STATUS_THEMES[status];

  const handleHearAlert = () => {
    if (isSpeaking) {
      speech.stop();
    } else {
      const textToSpeak = `${getSpokenAlertText(status, language)}. ${riskAssessment.actionSummary}`;
      speech.speak(textToSpeak, language);
    }
  };

  const handleShareLocation = async () => {
    const smsUrl = buildOfflineSMSUrl(
      '',
      status === 'LEAVE NOW' ? 'NEED_HELP' : 'SAFE',
      location.latitude,
      location.longitude,
      location.name,
      `Current Flood Status: ${status}`
    );

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `AquaShield Alert: ${location.name}`,
          text: `[AquaShield] Status: ${status}. Location: ${location.name} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`,
          url: `https://maps.google.com/?q=${location.latitude},${location.longitude}`,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
        return;
      } catch (_) {}
    }

    // Fallback to default SMS URI
    window.location.href = smsUrl;
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  const minutesAgo = Math.max(0, Math.round((Date.now() - riskAssessment.lastUpdated) / (1000 * 60)));

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-10">
      {/* Quick Location Pills for Instant Testing & Easy Switching */}
      {onLocationChange && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
            Quick Cities:
          </span>
          {PRESET_LOCATIONS.map((loc) => {
            const isSelected = loc.name === location.name;
            return (
              <button
                key={loc.name}
                onClick={() => onLocationChange(loc)}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80 shadow-[0_1px_3px_rgba(45,36,27,0.02)]'
                }`}
              >
                {loc.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Operating Mode C Stale Data Banner */}
      {isOffline && (
        <div className="bg-amber-50/90 border border-amber-200/90 text-amber-900 p-5 rounded-3xl text-sm flex items-start gap-3.5 shadow-xs">
          <span className="text-2xl mt-0.5">📡</span>
          <div className="space-y-1">
            <p className="font-bold text-amber-950 leading-snug">{dict.offlineBanner}</p>
            <p className="text-xs text-amber-800/90 font-medium leading-relaxed">
              Last saved assessment from {minutesAgo} {dict.minutesAgo}. Offline safety tools and shelters remain ready.
            </p>
          </div>
        </div>
      )}

      {/* 1. CURRENT FLOOD STATUS CARD (Aesthetic Warm Paper Look) */}
      <div
        className={`rounded-3xl p-7 sm:p-8 border-2 transition-all ${theme.cardBg} ${theme.cardBorder}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{theme.icon}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {location.name}, {location.country}
            </span>
          </div>
          <span className="text-xs font-semibold text-stone-500 bg-stone-50 px-3 py-1 rounded-full border border-stone-200/70">
            {location.elevationMeters ? `${location.elevationMeters}m elevation` : 'Flat Basin'}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3.5">
          <span
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight uppercase px-5 py-2 rounded-2xl shadow-xs ${theme.badgeBg}`}
          >
            {status}
          </span>
          <span className={`text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-2xl ${theme.badgeText}`}>
            {riskAssessment.urgency} Urgency Level
          </span>
        </div>

        {/* 2. WHAT THE USER SHOULD DO NOW */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <h2 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
            {dict.actionNow}
          </h2>
          <p className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
            {riskAssessment.actionSummary}
          </p>

          {riskAssessment.detailedGuidance.length > 0 && (
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-stone-600">
              {riskAssessment.detailedGuidance.map((guide, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className={`${theme.bulletColor} font-black text-sm leading-none mt-0.5`}>•</span>
                  <span className="leading-relaxed">{guide}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Real-Time Audio Caption Bar (when speaking) */}
      {isSpeaking && activeCaption && (
        <div className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-3xl flex items-center justify-between gap-3 text-sm shadow-xs animate-pulse">
          <div className="flex items-center gap-2.5 text-amber-950 font-medium">
            <span>🗣️</span>
            <span className="italic">{activeCaption}</span>
          </div>
          <button
            onClick={() => speech.stop()}
            className="text-xs bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 rounded-2xl text-white font-bold cursor-pointer transition shadow-xs"
          >
            {dict.btnStopAlert}
          </button>
        </div>
      )}

      {!voiceSupported && (
        <div className="text-xs text-amber-800 bg-amber-50/90 p-3 rounded-2xl border border-amber-200">
          ⚠️ {dict.voiceUnavailableWarning}
        </div>
      )}

      {/* 3. FOUR LARGE ACTION BUTTONS (Warm, Tactile & Accessible) */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* HEAR ALERT BUTTON */}
        <button
          onClick={handleHearAlert}
          aria-label={isSpeaking ? dict.btnStopAlert : dict.btnHearAlert}
          className={`flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl border font-bold transition-all shadow-[0_2px_8px_rgba(45,36,27,0.03)] active:scale-98 cursor-pointer ${
            isSpeaking
              ? 'bg-amber-500 border-amber-600 text-white shadow-md animate-pulse'
              : 'bg-white hover:bg-stone-50 border-stone-200/90 text-stone-800 hover:shadow-md'
          }`}
        >
          <span className="text-3xl mb-2">{isSpeaking ? '⏹️' : '🔊'}</span>
          <span className="text-sm sm:text-base tracking-tight font-extrabold text-stone-900">
            {isSpeaking ? dict.btnStopAlert : dict.btnHearAlert}
          </span>
          <span className="text-[11px] text-stone-400 mt-1 font-normal">
            {speechRate}x speed • Spoken Audio
          </span>
        </button>

        {/* SOS EMERGENCY BUTTON */}
        <button
          onClick={onOpenSOS}
          aria-label={dict.btnSos}
          className="flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-98 text-white font-extrabold tracking-tight shadow-lg shadow-rose-600/25 cursor-pointer border border-rose-400/30"
        >
          <span className="text-3xl mb-2 animate-bounce">🚨</span>
          <span className="text-sm sm:text-base">{dict.btnSos}</span>
          <span className="text-[11px] text-rose-100 mt-1 font-medium">Siren • Strobe • Call</span>
        </button>

        {/* CALL HELPLINE BUTTON */}
        <button
          onClick={onOpenHelpline}
          aria-label={dict.btnCallHelpline}
          className="flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl bg-white hover:bg-stone-50 active:scale-98 border border-stone-200/90 text-stone-800 font-extrabold shadow-[0_2px_8px_rgba(45,36,27,0.03)] hover:shadow-md cursor-pointer transition"
        >
          <span className="text-3xl mb-2">📞</span>
          <span className="text-sm sm:text-base text-stone-900">{dict.btnCallHelpline}</span>
          <span className="text-[11px] text-stone-400 mt-1 font-normal">Police • Rescue • NDRF</span>
        </button>

        {/* SHARE LOCATION BUTTON */}
        <button
          onClick={handleShareLocation}
          aria-label={dict.btnShareLocation}
          className="flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-extrabold shadow-md shadow-blue-500/20 cursor-pointer border border-blue-400/30 transition"
        >
          <span className="text-3xl mb-2">📍</span>
          <span className="text-sm sm:text-base">
            {shareSuccess ? 'LINK COPIED!' : dict.btnShareLocation}
          </span>
          <span className="text-[11px] text-blue-100 mt-1 font-medium">Instant SMS & GPS</span>
        </button>
      </div>

      {/* 4. NEARBY MAP & QUICK SHELTER PREVIEW (Warm Frame) */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200/80 shadow-[0_4px_20px_rgba(45,36,27,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
              Nearby Map & High-Ground Shelters
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Live danger perimeter and verified evacuation centers</p>
          </div>
          <button
            onClick={onOpenSafePlace}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-2xl cursor-pointer transition flex items-center gap-1"
          >
            <span>View All Shelters</span>
            <span>→</span>
          </button>
        </div>

        <FloodMap
          location={location}
          shelters={shelters}
          communityReports={communityReports}
          isOffline={isOffline}
          onSelectShelter={onOpenSafePlace}
        />
      </div>

      {/* 5. DATA FRESHNESS & CONNECTIVITY STATUS */}
      <div className="flex items-center justify-between text-xs text-stone-500 bg-white border border-stone-200/80 rounded-2xl px-5 py-3.5 shadow-[0_2px_8px_rgba(45,36,27,0.02)]">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOffline ? 'bg-amber-500' : 'bg-emerald-500'
            } animate-pulse`}
          ></span>
          <span className="font-semibold text-stone-700">
            {isOffline
              ? 'Mode C (Offline Storage Active)'
              : 'Live Intelligence (Open-Meteo & Sensors)'}
          </span>
        </div>
        <div className="text-stone-400 font-medium">
          {dict.lastUpdated}: {minutesAgo === 0 ? dict.justNow : `${minutesAgo} ${dict.minutesAgo}`}
        </div>
      </div>
    </div>
  );
};
