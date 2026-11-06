/**
 * Multilingual Speech Synthesis & Voice Alert Engine
 * Features:
 * - 12 languages voice mapping
 * - Speech rate controls (0.7x to 1.5x)
 * - Real-time captions callback
 * - Fallback detection when device engine lacks the language voice
 */

import { LanguageCode } from '../types';

export const LANGUAGE_SPEECH_TAGS: Record<LanguageCode, string[]> = {
  en: ['en-US', 'en-GB', 'en'],
  hi: ['hi-IN', 'hi'],
  te: ['te-IN', 'te'],
  ta: ['ta-IN', 'ta-LK', 'ta'],
  ne: ['ne-NP', 'ne'],
  bn: ['bn-BD', 'bn-IN', 'bn'],
  es: ['es-ES', 'es-MX', 'es'],
  fr: ['fr-FR', 'fr'],
  ar: ['ar-SA', 'ar-EG', 'ar'],
  pt: ['pt-BR', 'pt-PT', 'pt'],
  id: ['id-ID', 'id'],
  sw: ['sw-KE', 'sw-TZ', 'sw'],
};

export interface VoiceState {
  isSpeaking: boolean;
  currentCaption: string | null;
  hasVoiceForLanguage: boolean;
  rate: number;
}

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: ((state: VoiceState) => void)[] = [];
  private rate = 1.0;
  private isSpeaking = false;
  private currentCaption: string | null = null;
  private hasVoiceForLanguage = true;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(listener: (state: VoiceState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  public getState(): VoiceState {
    return {
      isSpeaking: this.isSpeaking,
      currentCaption: this.currentCaption,
      hasVoiceForLanguage: this.hasVoiceForLanguage,
      rate: this.rate,
    };
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.6, Math.min(1.6, newRate));
    this.notify();
  }

  /**
   * Speaks the text with appropriate voice tag and provides captioning
   */
  public speak(text: string, language: LanguageCode = 'en') {
    if (!this.synth) {
      this.hasVoiceForLanguage = false;
      this.currentCaption = text;
      this.notify();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;

    const availableVoices = this.synth.getVoices();
    const candidateTags = LANGUAGE_SPEECH_TAGS[language] || ['en'];

    // Find best matching voice
    let matchedVoice = availableVoices.find((v) =>
      candidateTags.some((tag) => v.lang.toLowerCase().startsWith(tag.toLowerCase()))
    );

    if (!matchedVoice && language !== 'en') {
      // Device speech engine lacks this specific language voice
      this.hasVoiceForLanguage = false;
      console.warn(`No native TTS voice found on device for ${language}. Falling back to default voice with caption.`);
    } else {
      this.hasVoiceForLanguage = true;
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else if (candidateTags[0]) {
      utterance.lang = candidateTags[0];
    }

    this.isSpeaking = true;
    this.currentCaption = text;
    this.notify();

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentCaption = null;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isSpeaking = false;
      this.currentCaption = null;
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Failed to start speech:', err);
      this.isSpeaking = false;
      this.notify();
    }
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (_) {}
    }
    this.isSpeaking = false;
    this.currentCaption = null;
    this.currentUtterance = null;
    this.notify();
  }
}

export const speech = new SpeechEngine();
