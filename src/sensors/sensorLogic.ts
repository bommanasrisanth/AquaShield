/**
 * ESP32 & IoT Sensor Signal Processing Logic
 * Implements median filtering, rate of rise calculation, and fault detection.
 */

import { SensorReading } from '../types';

export interface RawSensorReading {
  rawDistanceCm: number;
  batteryMillivolts?: number;
  timestamp?: number;
  sensorId?: string;
}

export interface SensorConfig {
  sensorMountHeightCm: number; // Distance from sensor face to riverbed/ground (e.g. 200cm)
  baselineWaterDepthCm: number; // Normal water depth (e.g. 20cm)
  elevatedThresholdCm: number; // Depth that triggers WATCH/PREPARE (e.g. 80cm)
  criticalThresholdCm: number; // Depth that triggers LEAVE NOW / Siren (e.g. 130cm)
  criticalRateOfRiseCmHr: number; // e.g. 15 cm/hr
}

export const DEFAULT_SENSOR_CONFIG: SensorConfig = {
  sensorMountHeightCm: 250,
  baselineWaterDepthCm: 25,
  elevatedThresholdCm: 90,
  criticalThresholdCm: 150,
  criticalRateOfRiseCmHr: 15,
};

/**
 * Applies a 5-point median filter to clean ultrasonic echo flutter and wave disturbances
 */
export function medianFilter(window: number[]): number {
  if (window.length === 0) return 0;
  const sorted = [...window].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Converts LiPo/18650 battery millivolts to percentage (3.0V = 0%, 4.2V = 100%)
 */
export function millivoltsToPercentage(mv: number): number {
  if (mv <= 3000) return 0;
  if (mv >= 4200) return 100;
  // Linear approximation of discharge curve
  return Math.round(((mv - 3000) / 1200) * 100);
}

/**
 * Calculates rate of rise in cm per hour between consecutive readings
 */
export function calculateRateOfRise(
  previousLevelCm: number,
  previousTimestampMs: number,
  currentLevelCm: number,
  currentTimestampMs: number
): number {
  const deltaHours = (currentTimestampMs - previousTimestampMs) / (1000 * 60 * 60);
  if (deltaHours <= 0) return 0;
  const deltaLevel = currentLevelCm - previousLevelCm;
  const rate = deltaLevel / deltaHours;
  // Round to 1 decimal place
  return Math.round(rate * 10) / 10;
}

/**
 * Detects sensor hardware faults: blind zone (<2cm), out of range (>450cm), or impossible jumps
 */
export function validateSensorDistance(
  rawDistanceCm: number,
  previousDistanceCm?: number
): { isValid: boolean; faultReason?: string } {
  if (rawDistanceCm <= 2) {
    return { isValid: false, faultReason: 'Sensor blind-zone echo error or ice/debris blockage' };
  }
  if (rawDistanceCm >= 450) {
    return { isValid: false, faultReason: 'No echo returned (out of range or ultrasonic beam lost)' };
  }
  if (previousDistanceCm !== undefined) {
    // If distance jumps more than 150cm in 1 second, it is likely an electrical glitch
    if (Math.abs(rawDistanceCm - previousDistanceCm) > 150) {
      return { isValid: false, faultReason: 'Extreme impossible transient jump detected' };
    }
  }
  return { isValid: true };
}

/**
 * Processes a raw sensor packet into a calibrated water level reading
 */
export function processSensorPacket(
  rawReading: RawSensorReading,
  recentDistancesWindow: number[],
  previousReading?: SensorReading | null,
  config: SensorConfig = DEFAULT_SENSOR_CONFIG
): { reading: SensorReading; updatedWindow: number[] } {
  const now = rawReading.timestamp || Date.now();
  const sensorId = rawReading.sensorId || 'ESP32_FLOOD_01';

  const validation = validateSensorDistance(
    rawReading.rawDistanceCm,
    previousReading ? previousReading.rawDistanceCm : undefined
  );

  // Maintain sliding window for median filter (max 5 samples)
  const updatedWindow = [...recentDistancesWindow, rawReading.rawDistanceCm].slice(-5);
  const filteredDistance = medianFilter(updatedWindow);

  // Water depth = total mount height minus ultrasonic distance to water surface
  const calculatedWaterLevelCm = Math.max(0, config.sensorMountHeightCm - filteredDistance);

  // Rate of rise
  let rateOfRise = 0;
  if (previousReading) {
    rateOfRise = calculateRateOfRise(
      previousReading.waterLevelCm,
      previousReading.timestamp,
      calculatedWaterLevelCm,
      now
    );
  }

  // Battery estimation
  const batteryPercentage = rawReading.batteryMillivolts
    ? millivoltsToPercentage(rawReading.batteryMillivolts)
    : (previousReading ? previousReading.batteryPercentage : 88);

  // Status determination
  let status: SensorReading['status'] = 'NORMAL';
  let faultReason = validation.faultReason;

  if (!validation.isValid) {
    status = 'FAULT';
  } else if (
    calculatedWaterLevelCm >= config.criticalThresholdCm ||
    rateOfRise >= config.criticalRateOfRiseCmHr
  ) {
    status = 'CRITICAL';
  } else if (calculatedWaterLevelCm >= config.elevatedThresholdCm || rateOfRise >= 8) {
    status = 'ELEVATED';
  }

  return {
    reading: {
      id: `reading-${now}-${Math.floor(Math.random() * 1000)}`,
      sensorId,
      timestamp: now,
      waterLevelCm: Math.round(calculatedWaterLevelCm * 10) / 10,
      baselineCm: config.baselineWaterDepthCm,
      rateOfRiseCmPerHour: rateOfRise,
      batteryPercentage,
      status,
      faultReason,
      rawDistanceCm: rawReading.rawDistanceCm,
      filteredDistanceCm: Math.round(filteredDistance * 10) / 10,
    },
    updatedWindow,
  };
}
