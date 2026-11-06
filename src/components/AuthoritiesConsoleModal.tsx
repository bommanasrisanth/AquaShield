/**
 * Authorities Emergency Broadcast & Incident Management Console — Aesthetic White Edition
 * Generates OASIS CAP 1.2 XML/JSON documents, telecom Cell Broadcast SMS payloads,
 * and incident verification workflows for disaster authorities.
 */

import React, { useState } from 'react';
import { LocationCoordinates, EvacuationShelter, CommunityReport, SensorReading, CAPAlert } from '../types';
import { generateCAP12Xml, generateCAP12Json, formatCellBroadcastMessage } from '../alerts/capGenerator';

interface AuthoritiesConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
  shelters: EvacuationShelter[];
  reports: CommunityReport[];
  sensor: SensorReading | null;
  currentStatus: string;
}

export const AuthoritiesConsoleModal: React.FC<AuthoritiesConsoleModalProps> = ({
  isOpen,
  onClose,
  location,
  shelters,
  reports,
  sensor,
  currentStatus,
}) => {
  const [headline, setHeadline] = useState(
    `Flash Flood Warning: Rapid water rise in ${location.name}`
  );
  const [severity, setSeverity] = useState<'Extreme' | 'Severe' | 'Moderate' | 'Minor'>('Extreme');
  const [urgency, setUrgency] = useState<'Immediate' | 'Expected' | 'Future'>('Immediate');
  const [instruction, setInstruction] = useState(
    'Move to designated high-ground shelters immediately. Do not drive through flooded roads.'
  );
  const [activeTab, setActiveTab] = useState<'BROADCAST' | 'CAP_XML' | 'INCIDENTS'>('BROADCAST');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCapAlert: CAPAlert = {
    identifier: `AQUASHIELD-${Date.now()}`,
    sender: 'disaster-authority@aquashield.org',
    sent: new Date().toISOString(),
    status: 'Actual',
    msgType: 'Alert',
    scope: 'Public',
    category: 'Met',
    event: 'Flood Emergency',
    urgency,
    severity,
    certainty: 'Observed',
    headline,
    description: `Water levels and discharge elevated. Sensor status: ${sensor?.status || 'NORMAL'}. Current risk status: ${currentStatus}.`,
    instruction,
    areaDesc: `${location.name}, ${location.country} and low-lying perimeter`,
    circleCoordinates: `${location.latitude},${location.longitude},12.0`,
  };

  const xmlContent = generateCAP12Xml(currentCapAlert);
  const jsonContent = JSON.stringify(generateCAP12Json(currentCapAlert), null, 2);
  const cellBroadcastSMS = formatCellBroadcastMessage('Flood Warning', headline, instruction);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} copied to clipboard!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Authorities Emergency Broadcast Console"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="w-full max-w-3xl h-[88vh] max-h-[740px] bg-white border border-slate-200/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-xs border border-indigo-100">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-lg">Authorities Emergency Console</h2>
                <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                  OFFICIAL USE
                </span>
              </div>
              <p className="text-xs text-slate-500">CAP 1.2 Oasis Standards • Cell Broadcast Telecom Payload</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 text-xs font-bold">
          <button
            onClick={() => setActiveTab('BROADCAST')}
            className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition ${
              activeTab === 'BROADCAST'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📢 Cell Broadcast (SMS/EAS)
          </button>
          <button
            onClick={() => setActiveTab('CAP_XML')}
            className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition ${
              activeTab === 'CAP_XML'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📄 CAP 1.2 XML / JSON
          </button>
          <button
            onClick={() => setActiveTab('INCIDENTS')}
            className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition ${
              activeTab === 'INCIDENTS'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Incident Verification ({reports.length})
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fafbfc]">
          {activeTab === 'BROADCAST' && (
            <div className="space-y-4">
              {/* Telecom Notice */}
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                <strong>Telecom Broadcast Architecture Note:</strong>
                <p className="leading-relaxed">
                  Mass alerting of all mobile devices across cell towers without AquaShield requires integration with national telecom emergency infrastructure (such as 3GPP Cell Broadcast / WEA / EAS). This console formats verified CAP 1.2 payloads ready for telecommunication gateway dispatch.
                </p>
              </div>

              {/* Alert Inputs */}
              <div className="space-y-3.5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Alert Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Severity
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Extreme">Extreme (Life Threat)</option>
                      <option value="Severe">Severe</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Minor">Minor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Urgency
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="Expected">Expected</option>
                      <option value="Future">Future</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Public Instruction
                  </label>
                  <textarea
                    rows={2}
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  ></textarea>
                </div>
              </div>

              {/* Cell Broadcast SMS Preview */}
              <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cell Broadcast / SMS Payload ({cellBroadcastSMS.length} / 160 chars)
                  </span>
                  <button
                    onClick={() => handleCopy(cellBroadcastSMS, 'Cell Broadcast message')}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer transition shadow-xs"
                  >
                    Copy Text
                  </button>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl font-mono text-xs text-slate-800 border border-slate-200/80 leading-relaxed">
                  {cellBroadcastSMS}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CAP_XML' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  OASIS CAP v1.2 XML Document
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(xmlContent, 'CAP XML')}
                    className="text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold cursor-pointer shadow-xs"
                  >
                    Copy XML
                  </button>
                  <button
                    onClick={() => handleCopy(jsonContent, 'CAP JSON')}
                    className="text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold cursor-pointer shadow-xs"
                  >
                    Copy JSON
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-96 shadow-inner">
                {xmlContent}
              </pre>
            </div>
          )}

          {activeTab === 'INCIDENTS' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Submitted Field Observations ({reports.length})
              </h3>
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 text-xs flex items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900">{r.reportType}</strong>
                      <span className="text-[10px] text-slate-500 font-medium">• {r.locationName}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{r.description}</p>
                    <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">
                      Depth: ~{r.waterDepthCm}cm • Status: {r.verificationStatus}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-bold border border-slate-200">
                      {r.upvotes} confirmations
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {copyFeedback && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center font-bold">
              {copyFeedback}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center font-medium">
          CAP 1.2 compliant payload ready for national meteorological and civil protection ingestion.
        </div>
      </div>
    </div>
  );
};
