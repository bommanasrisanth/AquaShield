/**
 * Community Flood Radar Modal — Aesthetic White Edition
 * Crowdsourced incident reporting with photo upload and offline queue.
 */

import React, { useState } from 'react';
import { CommunityReport, CommunityReportType, LocationCoordinates } from '../types';
import { submitCommunityReport, upvoteCommunityReport } from '../communication/communityRadar';

interface CommunityRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
  reports: CommunityReport[];
  isOffline: boolean;
  onReportsUpdated: () => void;
}

export const CommunityRadarModal: React.FC<CommunityRadarModalProps> = ({
  isOpen,
  onClose,
  location,
  reports,
  isOffline,
  onReportsUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportType, setReportType] = useState<CommunityReportType>('FLOODED_ROAD');
  const [description, setDescription] = useState('');
  const [waterDepth, setWaterDepth] = useState(30);
  const [isPassable, setIsPassable] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    await submitCommunityReport(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        locationName: location.name,
        reportType,
        description: description.trim(),
        waterDepthCm: waterDepth,
        isPassableForVehicles: isPassable,
        source: 'CITIZEN',
        photoUrl: photoPreview || undefined,
      },
      !isOffline
    );

    setDescription('');
    setPhotoPreview(null);
    setIsSubmitting(false);
    onReportsUpdated();
  };

  const handleUpvote = async (id: string) => {
    await upvoteCommunityReport(id);
    onReportsUpdated();
  };

  const unsyncedCount = reports.filter((r) => !r.synced).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Community Flood Radar"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="w-full max-w-xl h-[88vh] max-h-[740px] bg-white border border-slate-200/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-xs border border-blue-100">
              📡
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">Community Flood Radar</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>{reports.length} nearby observations</span>
                {unsyncedCount > 0 && (
                  <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {unsyncedCount} queued for sync
                  </span>
                )}
              </div>
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

        {/* Action Toggle */}
        <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">
            {isSubmitting ? 'Submit verified observation' : 'Live neighborhood reports'}
          </span>
          <button
            onClick={() => setIsSubmitting(!isSubmitting)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'View Reports' : '+ Report Flooding'}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#fafbfc]">
          {isSubmitting ? (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as CommunityReportType)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="FLOODED_ROAD">Flooded Road / Street</option>
                  <option value="WATER_ENTERING_BUILDING">Water Entering Building / Homes</option>
                  <option value="RISING_WATER">Rapidly Rising River / Canal</option>
                  <option value="BLOCKED_BRIDGE">Blocked Bridge / Culvert</option>
                  <option value="DRAINAGE_OVERFLOW">Stormwater Drainage Overflow</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated Water Depth: <span className="text-blue-600">{waterDepth} cm</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={waterDepth}
                  onChange={(e) => setWaterDepth(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Ankle (10cm)</span>
                  <span>Knee (50cm)</span>
                  <span>Waist (100cm)</span>
                  <span>Chest+ (150cm)</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <input
                  type="checkbox"
                  id="passable"
                  checked={isPassable}
                  onChange={(e) => setIsPassable(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="passable" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Road remains passable for large vehicles / emergency trucks
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description & Landmarks
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Underpass completely flooded under railway bridge, traffic diverting towards market."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                ></textarea>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Photo Evidence (Optional, cached offline)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-xs text-slate-500 file:mr-2 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
                {photoPreview && (
                  <div className="mt-2.5 w-32 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl text-sm transition shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                Submit Incident Report
              </button>
            </form>
          ) : (
            <div className="space-y-3.5">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">
                        {r.reportType === 'FLOODED_ROAD' ? '⚠️' : '🌊'}
                      </span>
                      <div>
                        <strong className="text-sm font-extrabold text-slate-900 block">
                          {r.reportType.replace(/_/g, ' ')}
                        </strong>
                        <span className="text-xs text-slate-500 font-medium">{r.locationName}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        r.verificationStatus === 'OFFICIALLY_VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.verificationStatus === 'COMMUNITY_CONFIRMED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {r.verificationStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>

                  {r.photoUrl && (
                    <div className="w-full max-h-40 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                      <img src={r.photoUrl} alt="Report attachment" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-3 font-medium">
                      <span>Water: ~{r.waterDepthCm || 20}cm</span>
                      <span>{r.isPassableForVehicles ? '🚙 Passable' : '🚫 Blocked'}</span>
                    </div>

                    <button
                      onClick={() => handleUpvote(r.id)}
                      className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold cursor-pointer text-xs transition"
                    >
                      <span>👍</span>
                      <span>Confirm ({r.upvotes})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center font-medium">
          All reports start as UNVERIFIED to prevent false alarms until validated by community members or authorities.
        </div>
      </div>
    </div>
  );
};
