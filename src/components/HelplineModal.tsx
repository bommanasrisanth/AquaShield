/**
 * Emergency Helplines Modal — Aesthetic White Edition
 * One-touch direct dialing to verified disaster management helplines.
 */

import React, { useState } from 'react';
import { Helpline, getHelplinesForCountry, EMERGENCY_HELPLINES } from '../communication/emergencyHelplines';
import { LocationCoordinates } from '../types';

interface HelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
}

export const HelplineModal: React.FC<HelplineModalProps> = ({ isOpen, onClose, location }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>(location.country);

  if (!isOpen) return null;

  const helplines: Helpline[] = getHelplinesForCountry(selectedCountry);
  const availableCountries = Object.keys(EMERGENCY_HELPLINES);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Disaster Emergency Helplines"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="w-full max-w-md h-[80vh] max-h-[620px] bg-white border border-slate-200/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-xs border border-emerald-100">
              📞
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">Emergency Helplines</h2>
              <p className="text-xs text-slate-500">Official Civil Protection & Rescue Desks</p>
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

        {/* Country Selector */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-100">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Country / National Jurisdiction
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
          >
            {availableCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Helplines List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#fafbfc]">
          {helplines.map((h, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">{h.service}</h3>
                  {h.isTollFree && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-extrabold">
                      TOLL FREE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{h.description}</p>
                <span className="text-sm font-mono font-black text-blue-600 mt-1 block">
                  {h.number}
                </span>
              </div>

              <a
                href={`tel:${h.number.replace(/\s+/g, '')}`}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-sm shadow-rose-500/25 flex items-center gap-1.5 cursor-pointer shrink-0 transition"
              >
                <span>📞</span>
                <span>Call Now</span>
              </a>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center font-medium">
          In an immediate life-threatening emergency, dial the national dispatch desk without delay.
        </div>
      </div>
    </div>
  );
};
