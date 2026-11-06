/**
 * Emergency Ready (Pre-Disaster Preparation) View — Aesthetic White Edition
 * Human-crafted checklist, readiness score indicator, and medically reviewed emergency protocols.
 */

import React, { useState, useEffect } from 'react';
import { EmergencyChecklistItem } from '../types';
import {
  getChecklistItems,
  toggleChecklistItem,
  calculateReadinessScore,
} from '../offline/offlinePack';

interface EmergencyReadyViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyReadyView: React.FC<EmergencyReadyViewProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<EmergencyChecklistItem[]>([]);
  const [activeTab, setActiveTab] = useState<'CHECKLIST' | 'WATER' | 'FIRST_AID'>('CHECKLIST');

  useEffect(() => {
    if (!isOpen) return;
    loadItems();
  }, [isOpen]);

  const loadItems = async () => {
    const list = await getChecklistItems();
    setItems(list);
  };

  if (!isOpen) return null;

  const handleToggle = async (id: string) => {
    const updated = await toggleChecklistItem(id);
    setItems(updated);
  };

  const readinessScore = calculateReadinessScore(items);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Emergency Ready Pre-Disaster Preparation"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl h-[88vh] max-h-[740px] bg-white border border-slate-200/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl shadow-xs border border-orange-100">
              🎒
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">Emergency Ready</h2>
              <p className="text-xs text-slate-500">Survival Preparation & Verified Medical Guidance</p>
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

        {/* Readiness Score Progress Card */}
        <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Household Readiness Indicator
              </span>
              <span className="font-extrabold text-sm text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/70">
                {readinessScore}% Ready
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                style={{ width: `${readinessScore}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  readinessScore >= 80
                    ? 'bg-emerald-500'
                    : readinessScore >= 50
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                }`}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              *Readiness Indicator reflects supply preparedness, not an absolute guarantee of safety.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 text-xs font-bold">
          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition ${
              activeTab === 'CHECKLIST'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Emergency Grab-Bag Checklist
          </button>
          <button
            onClick={() => setActiveTab('WATER')}
            className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition ${
              activeTab === 'WATER'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            💧 Safe Drinking Water
          </button>
          <button
            onClick={() => setActiveTab('FIRST_AID')}
            className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition ${
              activeTab === 'FIRST_AID'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🩺 Flood First Aid
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#fafbfc]">
          {activeTab === 'CHECKLIST' && (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 shadow-xs ${
                    item.isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200 opacity-85'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => {}}
                    className="w-4 h-4 mt-1 accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <strong
                        className={`text-sm ${
                          item.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 font-extrabold'
                        }`}
                      >
                        {item.title}
                      </strong>
                      {item.criticality === 'CRITICAL' && (
                        <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'WATER' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-5 bg-white border border-blue-200/90 rounded-2xl space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2 text-blue-800">
                  <span className="text-lg">🔥</span>
                  <h3 className="font-extrabold text-sm">Method 1: Vigorous Boiling (Most Reliable)</h3>
                </div>
                <p className="leading-relaxed">
                  Bring clear water to a rolling boil for at least <strong>1 full minute</strong> (at altitudes above 2,000 meters / 6,500 feet, boil for 3 minutes). Boiling kills disease-causing bacteria, viruses, and parasites. Allow water to cool naturally before drinking in clean covered containers.
                </p>
              </div>

              <div className="p-5 bg-white border border-amber-200/90 rounded-2xl space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2 text-amber-900">
                  <span className="text-lg">🧪</span>
                  <h3 className="font-extrabold text-sm">Method 2: Household Chlorine Bleach Disinfection</h3>
                </div>
                <p className="leading-relaxed">
                  If boiling fuel or electricity is unavailable, disinfect with liquid household bleach (unscented 5% to 6% sodium hypochlorite):
                </p>
                <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-slate-600">
                  <li>For clear water: Add <strong>2 drops</strong> per 1 liter (1 quart) of water.</li>
                  <li>For cloudy water: Filter through clean cloth first, then add <strong>4 drops</strong> per 1 liter.</li>
                  <li>Mix thoroughly and allow to stand for <strong>30 minutes</strong> before drinking.</li>
                  <li>The water should have a slight chlorine scent. If not, repeat the dose and wait another 15 minutes.</li>
                </ul>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-medium leading-relaxed">
                <strong>Crucial Health Warning:</strong> Never drink water with toxic chemical sheens, fuel odors, or agricultural runoff even after boiling. Chemical contaminants cannot be neutralized by boiling.
              </div>
            </div>
          )}

          {activeTab === 'FIRST_AID' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="text-lg">🫁</span>
                  <h3 className="font-extrabold text-sm">1. Submersion & Drowning Recovery</h3>
                </div>
                <p className="leading-relaxed text-slate-600">
                  Extract the person safely without placing yourself in danger. If unresponsive and not breathing normally, begin Hands-Only CPR immediately (100–120 compressions per minute in the center of the chest) until emergency medical personnel arrive.
                </p>
              </div>

              <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="text-lg">🩹</span>
                  <h3 className="font-extrabold text-sm">2. Leptospirosis & Wound Protection</h3>
                </div>
                <p className="leading-relaxed text-slate-600">
                  Floodwaters carry rodent urine containing Leptospira bacteria. Never walk barefoot in standing floodwaters. Clean any open scratches immediately with clean water and soap, apply antiseptic ointment, and cover with waterproof adhesive dressing.
                </p>
              </div>

              <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="text-lg">❄️</span>
                  <h3 className="font-extrabold text-sm">3. Hypothermia Management</h3>
                </div>
                <p className="leading-relaxed text-slate-600">
                  Prolonged immersion in cool water triggers rapid body temperature drops. Remove saturated clothing immediately. Wrap patient in dry blankets or emergency foil space blankets. Provide warm sweet drinks if conscious.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center font-medium">
          All preparedness guidance and checklists are permanently cached in your browser’s IndexedDB for offline access.
        </div>
      </div>
    </div>
  );
};
