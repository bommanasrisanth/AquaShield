/**
 * ESP32 Water-Level Sensor Simulator
 * Enables realistic demonstrations and testing without physical hardware.
 * Simulates ultrasonic echo readings, wave flutter, rain filling, and battery drain.
 */

import { SensorReading } from '../types';
import { processSensorPacket, DEFAULT_SENSOR_CONFIG, SensorConfig } from './sensorLogic';

export interface SimulatorState {
  isRunning: boolean;
  waterLevelCm: number; // Simulated true water depth
  isRaining: boolean;
  rainRatePerHour: number; // cm/hr rise
  batteryMillivolts: number;
  hasFault: boolean;
  faultType?: 'BLIND_ZONE' | 'OUT_OF_RANGE' | 'DISCONNECTED';
  noiseMagnitude: number; // cm random wave flutter
}

export class SensorSimulator {
  private state: SimulatorState = {
    isRunning: false,
    waterLevelCm: 45, // normal safe depth
    isRaining: false,
    rainRatePerHour: 20,
    batteryMillivolts: 3950, // ~80%
    hasFault: false,
    noiseMagnitude: 1.5,
  };

  private window: number[] = [];
  private lastReading: SensorReading | null = null;
  private intervalId: any = null;
  private listeners: ((reading: SensorReading, state: SimulatorState) => void)[] = [];
  private config: SensorConfig = DEFAULT_SENSOR_CONFIG;

  public subscribe(callback: (reading: SensorReading, state: SimulatorState) => void): () => void {
    this.listeners.push(callback);
    if (this.lastReading) {
      callback(this.lastReading, this.state);
    }
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public setWaterLevel(levelCm: number) {
    this.state.waterLevelCm = Math.max(0, Math.min(this.config.sensorMountHeightCm - 5, levelCm));
    this.tick();
  }

  public toggleRain(enable?: boolean) {
    this.state.isRaining = enable !== undefined ? enable : !this.state.isRaining;
  }

  public setFault(fault: SimulatorState['faultType'] | false) {
    if (!fault) {
      this.state.hasFault = false;
      this.state.faultType = undefined;
    } else {
      this.state.hasFault = true;
      this.state.faultType = fault;
    }
    this.tick();
  }

  public start(intervalMs = 2000) {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), intervalMs);
    this.tick();
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state.isRunning = false;
  }

  public getState(): SimulatorState {
    return { ...this.state };
  }

  public tick() {
    // If rain is active, increase water depth
    if (this.state.isRaining) {
      // 2-second tick equivalent rise
      const riseIncrement = (this.state.rainRatePerHour / 3600) * 2;
      this.state.waterLevelCm = Math.min(
        this.config.sensorMountHeightCm - 5,
        this.state.waterLevelCm + riseIncrement
      );
    }

    // Gentle battery drain
    this.state.batteryMillivolts = Math.max(3000, this.state.batteryMillivolts - 0.05);

    // Compute raw ultrasonic distance = Mount height - Water depth + wave noise
    const noise = (Math.random() - 0.5) * 2 * this.state.noiseMagnitude;
    let rawDistance = this.config.sensorMountHeightCm - this.state.waterLevelCm + noise;

    if (this.state.hasFault) {
      if (this.state.faultType === 'BLIND_ZONE') rawDistance = 1.2;
      else if (this.state.faultType === 'OUT_OF_RANGE') rawDistance = 480;
      else if (this.state.faultType === 'DISCONNECTED') rawDistance = 0;
    }

    const { reading, updatedWindow } = processSensorPacket(
      {
        rawDistanceCm: Math.round(rawDistance * 10) / 10,
        batteryMillivolts: Math.round(this.state.batteryMillivolts),
        sensorId: 'ESP32_SIMULATED_01',
      },
      this.window,
      this.lastReading,
      this.config
    );

    this.window = updatedWindow;
    this.lastReading = reading;

    for (const listener of this.listeners) {
      listener(reading, this.state);
    }
  }
}

export const sensorSimulator = new SensorSimulator();
