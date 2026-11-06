/**
 * Personal Emergency Companion Modal — Human Aesthetic White Edition
 * Voice & text disaster assistant with calm, readable white styling.
 */

import React, { useState } from 'react';
import { askEmergencyCompanion, CompanionResponse } from '../api/geminiClient';
import { speech } from '../alerts/speechVoice';
import { LanguageCode, LocationCoordinates } from '../types';

interface EmergencyCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
  status: string;
  language: LanguageCode;
  isOffline: boolean;
}

export const EmergencyCompanionModal: React.FC<EmergencyCompanionModalProps> = ({
  isOpen,
  onClose,
  location,
  status,
  language,
  isOffline,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; source?: string }[]
  >([
    {
      role: 'assistant',
      text: `Hello. I am AquaShield's Emergency Safety Companion. Ask me what to do, how to secure drinking water, or what to pack. All guidance remains accessible even offline.`,
    },
  ]);

  if (!isOpen) return null;

  const quickQuestions = [
    'What should I do right now?',
    'What if my road is flooded?',
    'How do I purify drinking water?',
    'What goes in my 72-hour emergency grab-bag?',
    'Where is high ground or nearest shelter?',
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      const response: CompanionResponse = await askEmergencyCompanion(
        textToSend,
        {
          locationName: location.name,
          status,
          elevation: location.elevationMeters,
        },
        isOffline
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.reply,
          source: response.source === 'GEMINI_AI' ? 'Gemini AI' : 'Offline Safety Rulebase',
        },
      ]);
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Turn Around Don\'t Drown. If waters rise, move immediately to higher ground.',
          source: 'Offline Fallback',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Personal Emergency Companion"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="w-full max-w-xl h-[85vh] max-h-[660px] bg-white border border-slate-200/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-xs border border-blue-100">
              🤖
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Emergency Companion</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOffline ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                ></span>
                <span>{isOffline ? 'Offline Rulebase Active' : 'Gemini AI & Offline Ready'}</span>
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

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex gap-2 overflow-x-auto text-xs no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 cursor-pointer active:scale-95 transition font-semibold shadow-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#fafbfc]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`p-4 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80'
                }`}
              >
                {msg.text}
              </div>

              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-1.5 px-1">
                  {msg.source && (
                    <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                      {msg.source}
                    </span>
                  )}
                  <button
                    onClick={() => speech.speak(msg.text, language)}
                    title="Read out loud"
                    className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-semibold flex items-center gap-1"
                  >
                    <span>🔊</span>
                    <span>Read</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50/80 p-3 rounded-2xl border border-blue-200 w-fit">
              <span className="animate-spin">⏳</span>
              <span>Consulting emergency safety protocol...</span>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a flood safety question..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl text-sm font-bold cursor-pointer transition shadow-sm shadow-blue-500/20"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
