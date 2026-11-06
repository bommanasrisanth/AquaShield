/**
 * Web Audio API Emergency Siren & Alarm Synthesizer
 * Operates 100% offline without audio file downloads.
 * Generates calibrated dual-tone emergency warble siren.
 */

class SirenSynthesizer {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Starts emergency dual-frequency warble siren
   */
  public startSiren(volume = 0.8) {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Master Gain
      this.gain = this.ctx.createGain();
      this.gain.gain.setValueAtTime(Math.min(1, Math.max(0, volume)), now);
      this.gain.connect(this.ctx.destination);

      // Carrier Oscillator (750 Hz base emergency pitch)
      this.osc = this.ctx.createOscillator();
      this.osc.type = 'sawtooth';
      this.osc.frequency.setValueAtTime(750, now);

      // Low-Frequency Oscillator (LFO) to create realistic warble sweep (1.8 Hz sweep between 600Hz and 1100Hz)
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(1.8, now);

      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(250, now); // Sweep amplitude +/- 250Hz

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.osc.frequency);

      this.osc.connect(this.gain);

      this.lfo.start(now);
      this.osc.start(now);
      this.isPlaying = true;
    } catch (err) {
      console.warn('AudioContext siren initialization failed:', err);
    }
  }

  /**
   * Stops the siren immediately
   */
  public stopSiren() {
    if (!this.isPlaying) return;
    try {
      if (this.osc) {
        this.osc.stop();
        this.osc.disconnect();
        this.osc = null;
      }
      if (this.lfo) {
        this.lfo.stop();
        this.lfo.disconnect();
        this.lfo = null;
      }
      if (this.gain) {
        this.gain.disconnect();
        this.gain = null;
      }
      this.isPlaying = false;
    } catch (err) {
      console.warn('Error stopping siren:', err);
      this.isPlaying = false;
    }
  }

  /**
   * Plays a short single confirmation beep (e.g., button tap or alert update)
   */
  public playBeep(freq = 880, durationMs = 150) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (durationMs / 1000));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (durationMs / 1000));
    } catch (_) {}
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const siren = new SirenSynthesizer();
