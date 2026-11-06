/**
 * Offline Preparation Modal — Aesthetic White Edition
 * Allows users to pre-cache the full offline emergency pack before disaster strikes.
 */

import React, { useState } from 'react';
import { downloadOfflineEmergencyPack } from '../offline/offlinePack';

interface OfflinePreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackInstalled: () => void;
}

export const OfflinePreparationModal: React.FC<OfflinePreparationModalProps> = ({
  isOpen,
  onClose,
  onPackInstalled,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Ready to prepare offline emergency resources.');
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const handleStartDownload = async () => {
    setIsDownloading(true);
    const success = await downloadOfflineEmergencyPack((pct, status) => {
      setProgress(pct);
      setStatusText(status);
    });

    if (success) {
      setIsComplete(true);
      onPackInstalled();
    }
    setIsDownloading(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Offline Preparation Pack"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl border border-blue-100 shadow-xs">
              📦
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">Offline Preparation Pack</h2>
              <p className="text-xs text-slate-500 font-medium">Pre-cache full survival database</p>
            </div>
          </div>
          {!isDownloading && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer text-sm font-bold transition"
            >
              ✕
            </button>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          When severe floods hit, cell towers, power grids, and internet backbones frequently fail. Pre-downloading AquaShield’s offline emergency database ensures you have immediate access to high-ground shelters, water purification rules, first aid protocols, and local sensor decoders without any internet connection.
        </p>

        {/* Progress Display */}
        {isDownloading || isComplete ? (
          <div className="space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">{statusText}</span>
              <span className="text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-blue-600 transition-all duration-200 rounded-full"
              ></div>
            </div>
          </div>
        ) : null}

        {/* Action Button */}
        <div className="pt-2">
          {isComplete ? (
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-sm transition cursor-pointer shadow-xs"
            >
              ✅ Offline Pack Installed — Done
            </button>
          ) : (
            <button
              onClick={handleStartDownload}
              disabled={isDownloading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25"
            >
              <span>{isDownloading ? '⏳' : '📥'}</span>
              <span>
                {isDownloading ? 'Downloading Offline Database...' : 'Download Offline Emergency Pack (~1 MB)'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
