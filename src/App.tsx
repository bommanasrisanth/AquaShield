/**
 * FloodGuard Main Application Shell
 * Global AI-Powered Flood Intelligence, Life-Saving & Offline Emergency Response System
 */

import React, { useState, useEffect } from 'react';
import {
  LocationCoordinates,
  LanguageCode,
  OperatingMode,
  RiskAssessment,
  EvacuationShelter,
  CommunityReport,
  SensorReading,
  EmergencyContact,
} from './types';
import { calculateFloodRisk } from './intelligence/floodRisk';
import { fetchLiveFloodData } from './api/openMeteo';
import { getSheltersForLocation } from './evacuation/shelters';
import { getCommunityReports } from './communication/communityRadar';
import { getSavedEmergencyContacts } from './communication/familyNetwork';
import { isOfflinePackInstalled } from './offline/offlinePack';
import { detectBrowserLanguage, isRTL } from './i18n/translations';
import { Navbar, PRESET_LOCATIONS } from './components/Navbar';
import { CitizenDashboard } from './components/CitizenDashboard';
import { SOSOverlay } from './components/SOSOverlay';
import { HelplineModal } from './components/HelplineModal';
import { EmergencyCompanionModal } from './components/EmergencyCompanionModal';
import { SmartSafePlaceModal } from './components/SmartSafePlaceModal';
import { FamilyNetworkModal } from './components/FamilyNetworkModal';
import { CommunityRadarModal } from './components/CommunityRadarModal';
import { SensorDashboardModal } from './components/SensorDashboardModal';
import { EmergencyReadyView } from './components/EmergencyReadyView';
import { AuthoritiesConsoleModal } from './components/AuthoritiesConsoleModal';
import { OfflinePreparationModal } from './components/OfflinePreparationModal';
import { sensorSimulator } from './sensors/sensorSimulator';

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates>(PRESET_LOCATIONS[0]);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(detectBrowserLanguage);
  const [isSimulatingOffline, setIsSimulatingOffline] = useState(false);
  const [isBrowserOnline, setIsBrowserOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const isOffline = !isBrowserOnline || isSimulatingOffline;
  const operatingMode: OperatingMode = isOffline ? 'MODE_C_OFFLINE' : 'MODE_A_ONLINE';

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');

  // Modals
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);
  const [isSafePlaceOpen, setIsSafePlaceOpen] = useState(false);
  const [isOfflinePackOpen, setIsOfflinePackOpen] = useState(false);
  const [isPackInstalled, setIsPackInstalled] = useState(false);

  // Data States
  const [shelters, setShelters] = useState<EvacuationShelter[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [primaryContact, setPrimaryContact] = useState<EmergencyContact | undefined>();
  const [sensorReading, setSensorReading] = useState<SensorReading | null>(null);

  // Weather & Risk State
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>(() =>
    calculateFloodRisk({
      elevationMeters: currentLocation.elevationMeters,
      isOffline,
    })
  );

  // Online / Offline Window Listener
  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if offline pack is pre-cached
    isOfflinePackInstalled().then((installed) => setIsPackInstalled(installed));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sensor Simulator subscription
  useEffect(() => {
    const unsub = sensorSimulator.subscribe((reading) => {
      setSensorReading(reading);
    });
    return () => unsub();
  }, []);

  // Refresh data when location or offline mode changes
  useEffect(() => {
    loadLocationData();
  }, [currentLocation, isOffline, sensorReading]);

  const loadLocationData = async () => {
    // 1. Shelters
    const locShelters = getSheltersForLocation(
      currentLocation,
      currentLocation.elevationMeters || 20
    );
    setShelters(locShelters);

    // 2. Community reports
    const reports = await getCommunityReports();
    setCommunityReports(reports);

    // 3. Contacts
    const contacts = await getSavedEmergencyContacts();
    const primary = contacts.find((c) => c.isPrimary) || contacts[0];
    setPrimaryContact(primary);

    // 4. Fetch Weather & Flood API
    const weatherData = await fetchLiveFloodData(currentLocation, isOffline);

    // 5. Calculate Risk Assessment
    const assessment = calculateFloodRisk({
      riverDischarge: weatherData.riverDischarge,
      rainfall: weatherData.rainfall,
      elevationMeters: weatherData.elevationMeters,
      sensor: sensorReading,
      communityReportCount: reports.length,
      lastFetchTimestamp: weatherData.timestamp,
      isOffline,
    });

    setRiskAssessment(assessment);
  };

  const emergencyNumber =
    currentLocation.country === 'India'
      ? '112'
      : currentLocation.country === 'Nepal'
        ? '1155'
        : currentLocation.country === 'Bangladesh'
          ? '999'
          : currentLocation.country === 'USA'
            ? '911'
            : currentLocation.country === 'Kenya'
              ? '999'
              : '112';

  const rtl = isRTL(currentLanguage);

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#faf8f5] text-stone-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-200 selection:text-amber-950"
    >
      {/* Top Navbar */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        currentLocation={currentLocation}
        onLocationChange={setCurrentLocation}
        operatingMode={operatingMode}
        onToggleSimulateOffline={() => setIsSimulatingOffline(!isSimulatingOffline)}
        isSimulatingOffline={isSimulatingOffline}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isPackInstalled={isPackInstalled}
        onOpenOfflinePackModal={() => setIsOfflinePackOpen(true)}
      />

      {/* Main View Area with Increased Whitespace and Softer Flow */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {activeTab === 'DASHBOARD' && (
          <CitizenDashboard
            status={riskAssessment.status}
            riskAssessment={riskAssessment}
            location={currentLocation}
            onLocationChange={setCurrentLocation}
            shelters={shelters}
            communityReports={communityReports}
            language={currentLanguage}
            isOffline={isOffline}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenHelpline={() => setIsHelplineOpen(true)}
            onOpenSafePlace={() => setIsSafePlaceOpen(true)}
          />
        )}

        {activeTab === 'COMPANION' && (
          <div className="py-4 sm:py-6">
            <EmergencyCompanionModal
              isOpen={true}
              onClose={() => setActiveTab('DASHBOARD')}
              location={currentLocation}
              status={riskAssessment.status}
              language={currentLanguage}
              isOffline={isOffline}
            />
          </div>
        )}

        {activeTab === 'SAFEPLACE' && (
          <div className="py-4 sm:py-6">
            <SmartSafePlaceModal
              isOpen={true}
              onClose={() => setActiveTab('DASHBOARD')}
              location={currentLocation}
              shelters={shelters}
            />
          </div>
        )}

        {activeTab === 'FAMILY' && (
          <div className="py-4 sm:py-6">
            <FamilyNetworkModal
              isOpen={true}
              onClose={() => setActiveTab('DASHBOARD')}
              location={currentLocation}
              isOffline={isOffline}
            />
          </div>
        )}

        {activeTab === 'SENSORS' && (
          <div className="py-4 sm:py-6">
            <SensorDashboardModal
              isOpen={true}
              onClose={() => setActiveTab('DASHBOARD')}
              activeReading={sensorReading}
              onReadingUpdate={setSensorReading}
            />
          </div>
        )}

        {activeTab === 'READINESS' && (
          <div className="py-4 sm:py-6">
            <EmergencyReadyView
              isOpen={true}
              onClose={() => setActiveTab('DASHBOARD')}
            />
          </div>
        )}

        {activeTab === 'AUTHORITIES' && (
          <div className="py-4 sm:py-6">
            <AuthoritiesConsoleModal
              isOpen={true}
              onClose={() => setActiveTab('DASHBOARD')}
              location={currentLocation}
              shelters={shelters}
              reports={communityReports}
              sensor={sensorReading}
              currentStatus={riskAssessment.status}
            />
          </div>
        )}
      </main>

      {/* Persistent Global Modals */}
      <SOSOverlay
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        location={currentLocation}
        primaryContact={primaryContact}
        emergencyNumber={emergencyNumber}
      />

      <HelplineModal
        isOpen={isHelplineOpen}
        onClose={() => setIsHelplineOpen(false)}
        location={currentLocation}
      />

      <SmartSafePlaceModal
        isOpen={isSafePlaceOpen}
        onClose={() => setIsSafePlaceOpen(false)}
        location={currentLocation}
        shelters={shelters}
      />

      <OfflinePreparationModal
        isOpen={isOfflinePackOpen}
        onClose={() => setIsOfflinePackOpen(false)}
        onPackInstalled={() => setIsPackInstalled(true)}
      />

      {/* Accessible Human-Crafted Warm Footer */}
      <footer className="w-full border-t border-stone-200/80 bg-white/80 backdrop-blur-md py-6 sm:py-8 text-center text-xs text-stone-500 shadow-[0_-2px_12px_rgba(45,36,27,0.02)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-stone-800 text-sm tracking-tight">AquaShield</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-600 font-medium">Life-Saving Disaster Companion</span>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200/70">
            {isOffline ? 'Mode C (Offline Engine Active)' : 'Mode A (Online Connected)'}
          </span>
        </div>
      </footer>
    </div>
  );
}
