/**
 * Family Safety Network & Offline Check-In Modal — Aesthetic White Edition
 * Manages up to 3 emergency contacts, common meeting points, and check-in timeline.
 */

import React, { useState, useEffect } from 'react';
import { EmergencyContact, FamilyCheckIn, LocationCoordinates } from '../types';
import {
  getSavedEmergencyContacts,
  saveEmergencyContact,
  deleteEmergencyContact,
  recordFamilyCheckIn,
  getFamilyCheckIns,
  buildOfflineSMSUrl,
} from '../communication/familyNetwork';

interface FamilyNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
  isOffline: boolean;
}

export const FamilyNetworkModal: React.FC<FamilyNetworkModalProps> = ({
  isOpen,
  onClose,
  location,
  isOffline,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [checkIns, setCheckIns] = useState<FamilyCheckIn[]>([]);
  const [meetingPoint, setMeetingPoint] = useState<string>(() => {
    return localStorage.getItem('floodguard_meeting_point') || 'City Municipal Stadium High Ground';
  });
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('Family');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [lastCheckInMessage, setLastCheckInMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen]);

  const loadData = async () => {
    const loadedContacts = await getSavedEmergencyContacts();
    const loadedCheckIns = await getFamilyCheckIns();
    setContacts(loadedContacts);
    setCheckIns(loadedCheckIns);
  };

  if (!isOpen) return null;

  const handleSaveContact = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    if (contacts.length >= 3) {
      alert('You can save up to 3 priority emergency contacts.');
      return;
    }

    const contact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      relation: newRelation,
      isPrimary: contacts.length === 0,
    };

    await saveEmergencyContact(contact);
    setNewName('');
    setNewPhone('');
    setIsAddingContact(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await deleteEmergencyContact(id);
    loadData();
  };

  const handleCheckIn = async (status: 'SAFE' | 'NEED_HELP' | 'EVACUATING') => {
    const res = await recordFamilyCheckIn(
      status,
      location.latitude,
      location.longitude,
      location.name,
      `Meeting Point: ${meetingPoint}`,
      !isOffline
    );

    setLastCheckInMessage(`Check-in recorded as "${status}" at ${new Date(res.timestamp).toLocaleTimeString()}`);
    loadData();
    setTimeout(() => setLastCheckInMessage(null), 4000);
  };

  const handleSaveMeetingPoint = (val: string) => {
    setMeetingPoint(val);
    localStorage.setItem('floodguard_meeting_point', val);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Family Safety Network"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="w-full max-w-xl h-[88vh] max-h-[720px] bg-white border border-slate-200/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-xs border border-amber-100">
              👨‍👩‍👧‍👦
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">Family Safety Network</h2>
              <p className="text-xs text-slate-500">Offline check-in & emergency SMS broadcast</p>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fafbfc]">
          {/* One-Tap Check-In Bar */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Send Status Check-In
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                {isOffline ? 'Queued offline' : 'Instant sync'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCheckIn('SAFE')}
                className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-500/20 active:scale-98"
              >
                <span>✅</span>
                <span>I Am Safe</span>
              </button>

              <button
                onClick={() => handleCheckIn('NEED_HELP')}
                className="py-3.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-2xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-500/20 active:scale-98"
              >
                <span>🆘</span>
                <span>Need Assistance</span>
              </button>
            </div>

            {lastCheckInMessage && (
              <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center font-bold">
                {lastCheckInMessage}
              </div>
            )}
          </div>

          {/* Common Family Meeting Point */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Common Family Meeting Point
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">When cell network fails</span>
            </div>
            <input
              type="text"
              value={meetingPoint}
              onChange={(e) => handleSaveMeetingPoint(e.target.value)}
              placeholder="e.g. Central High School Roof or Hill Temple"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
            <p className="text-[11px] text-slate-500">
              Saved locally on this device. All family members know to assemble here if communications go dark.
            </p>
          </div>

          {/* Emergency Contacts (Max 3) */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Emergency Contacts ({contacts.length} / 3)
                </h3>
                <span className="text-[11px] text-slate-400">Stored locally on your phone</span>
              </div>
              {contacts.length < 3 && !isAddingContact && (
                <button
                  onClick={() => setIsAddingContact(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition"
                >
                  + Add Contact
                </button>
              )}
            </div>

            {isAddingContact && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <input
                  type="text"
                  placeholder="Contact Name (e.g. Mom, Brother, Neighbor)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (+XX XXXXXXXXXX)"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsAddingContact(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContact}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {contacts.map((c) => {
                const smsUrl = buildOfflineSMSUrl(
                  c.phone,
                  'SAFE',
                  location.latitude,
                  location.longitude,
                  location.name,
                  `Meeting Point: ${meetingPoint}`
                );

                return (
                  <div
                    key={c.id}
                    className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-slate-800">{c.name}</strong>
                        {c.isPrimary && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.phone || 'No phone set'}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.phone && (
                        <>
                          <a
                            href={`tel:${c.phone}`}
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs shadow-xs"
                            title="Call"
                          >
                            📞
                          </a>
                          <a
                            href={smsUrl}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs"
                            title="Send Offline SOS via SMS"
                          >
                            💬 Send SMS
                          </a>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-slate-400 hover:text-rose-600 text-sm px-1.5 cursor-pointer"
                        title="Delete contact"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Check-Ins Timeline */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-2.5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recent Check-Ins ({checkIns.length})
            </h3>
            {checkIns.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No check-in recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {checkIns.slice(0, 5).map((ci) => (
                  <div
                    key={ci.id}
                    className="text-xs p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className={ci.status === 'SAFE' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {ci.status === 'SAFE' ? '✅ Safe' : '🆘 Help Needed'}
                      </span>
                      <span className="text-slate-500">• {ci.locationName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(ci.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center font-medium">
          Store-and-forward: offline check-ins will automatically synchronize once internet connectivity is restored.
        </div>
      </div>
    </div>
  );
};
