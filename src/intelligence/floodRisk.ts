/**
 * Multi-Source Flood Intelligence Engine
 * Computes calibrated risk level, urgency, confidence, and action summaries.
 * Separates physical hazard severity from human response urgency.
 */

import { FloodStatusLevel, RiskAssessment, RiverDischargeData, RainfallData, SensorReading } from '../types';

export interface FloodRiskInputs {
  riverDischarge?: RiverDischargeData;
  rainfall?: RainfallData;
  elevationMeters?: number;
  sensor?: SensorReading | null;
  communityReportCount?: number;
  lastFetchTimestamp?: number;
  isOffline?: boolean;
}

/**
 * Calculates flood risk level and personalized response instructions
 */
export function calculateFloodRisk(inputs: FloodRiskInputs): RiskAssessment {
  const {
    riverDischarge,
    rainfall,
    elevationMeters = 20,
    sensor,
    communityReportCount = 0,
    lastFetchTimestamp = Date.now(),
    isOffline = false,
  } = inputs;

  const now = Date.now();
  const ageMinutes = (now - lastFetchTimestamp) / (1000 * 60);
  const isStale = ageMinutes > 30 || isOffline;
  const staleReason = isOffline
    ? 'Operating in complete offline mode. Using cached baseline and local sensors only.'
    : ageMinutes > 30
      ? `Forecast data is ${Math.round(ageMinutes)} minutes old. Verify with local observations.`
      : undefined;

  // 1. River Discharge Risk (0 - 100)
  let riverScore = 0;
  if (riverDischarge) {
    const ratioToThreshold = riverDischarge.dischargeThresholdM3s > 0
      ? riverDischarge.currentDischargeM3s / riverDischarge.dischargeThresholdM3s
      : 0.5;

    if (ratioToThreshold >= 1.5) riverScore = 95;
    else if (ratioToThreshold >= 1.1) riverScore = 80;
    else if (ratioToThreshold >= 0.8) riverScore = 55;
    else if (ratioToThreshold >= 0.5) riverScore = 30;
    else riverScore = 10;

    // Rate of rise adjustment
    if (riverDischarge.rateOfRisePerHour > 50) riverScore = Math.min(100, riverScore + 20);
    else if (riverDischarge.rateOfRisePerHour > 20) riverScore = Math.min(100, riverScore + 10);
  } else {
    riverScore = 20; // default baseline when river gauge is unavailable
  }

  // 2. Rainfall Risk (0 - 100)
  let rainScore = 0;
  if (rainfall) {
    const mm24h = rainfall.rainLast24HoursMm;
    const mm1h = rainfall.rainLast1HourMm;

    if (mm1h >= 40 || mm24h >= 150) rainScore = 95;
    else if (mm1h >= 20 || mm24h >= 90) rainScore = 75;
    else if (mm1h >= 10 || mm24h >= 50) rainScore = 50;
    else if (mm1h >= 3 || mm24h >= 20) rainScore = 25;
    else rainScore = 5;
  } else {
    rainScore = 15;
  }

  // 3. Elevation Vulnerability (0 - 100)
  // Low-lying coastal/delta/floodplain areas below 15m have higher vulnerability
  let elevationVulnerability = 20;
  if (elevationMeters <= 5) elevationVulnerability = 85;
  else if (elevationMeters <= 12) elevationVulnerability = 65;
  else if (elevationMeters <= 25) elevationVulnerability = 40;
  else if (elevationMeters <= 50) elevationVulnerability = 20;
  else elevationVulnerability = 10;

  // 4. Local IoT Sensor Alert Level (0 - 100)
  let sensorAlertLevel = 0;
  if (sensor && sensor.status !== 'FAULT') {
    if (sensor.status === 'CRITICAL') sensorAlertLevel = 100;
    else if (sensor.status === 'ELEVATED') sensorAlertLevel = 70;
    else sensorAlertLevel = 15;

    // High rate of rise from local sensor overrides regional models
    if (sensor.rateOfRiseCmPerHour >= 15) {
      sensorAlertLevel = Math.max(sensorAlertLevel, 90);
    }
  }

  // 5. Community Incident Reports Weight
  const communityWeight = Math.min(30, communityReportCount * 8);

  // Composite Weighted Score
  // If a local IoT sensor detects critical water rise, it immediately elevates response
  let compositeScore = 0;
  if (sensor && sensor.status === 'CRITICAL') {
    compositeScore = Math.max(85, (riverScore * 0.25) + (rainScore * 0.25) + (sensorAlertLevel * 0.5));
  } else {
    compositeScore =
      (riverScore * 0.35) +
      (rainScore * 0.35) +
      (elevationVulnerability * 0.15) +
      (sensorAlertLevel * 0.15) +
      communityWeight;
  }

  compositeScore = Math.min(100, Math.max(0, compositeScore));

  // Determine Flood Status Level
  let status: FloodStatusLevel = 'SAFE';
  let urgency: RiskAssessment['urgency'] = 'Low';
  let actionSummary = 'Conditions are currently normal. Maintain everyday flood awareness.';
  const detailedGuidance: string[] = [];

  if (compositeScore >= 78) {
    status = 'LEAVE NOW';
    urgency = 'Immediate Life Threat';
    actionSummary = 'Water is rising rapidly or extreme flooding is imminent. Evacuate to higher ground immediately.';
    detailedGuidance.push('Move immediately to upper floors or an official designated high-ground shelter.');
    detailedGuidance.push('NEVER walk, swim, or drive through flooded roads (Turn Around Don\'t Drown).');
    detailedGuidance.push('Turn off main electricity, gas valves, and water supply if safe to do so before leaving.');
    detailedGuidance.push('Keep your mobile phone in a waterproof bag and follow instructions from emergency authorities.');
  } else if (compositeScore >= 52) {
    status = 'PREPARE';
    urgency = 'High';
    actionSummary = 'Severe flood conditions developing. Get emergency grab-bag ready and monitor evacuation routes.';
    detailedGuidance.push('Pack essential medications, drinking water, identification documents, and power banks.');
    detailedGuidance.push('Check the nearest verified shelter and confirm family meeting points.');
    detailedGuidance.push('Move valuable possessions and appliances to upper floors.');
    detailedGuidance.push('Secure or elevate drinking water supplies to prevent contamination.');
  } else if (compositeScore >= 28) {
    status = 'WATCH';
    urgency = 'Moderate';
    actionSummary = 'River or rain runoff is elevated. Stay alert and avoid low-lying riverbanks and drainage paths.';
    detailedGuidance.push('Stay informed via AquaShield alerts and local weather bulletins.');
    detailedGuidance.push('Inspect local stormwater drains around your dwelling for blockages.');
    detailedGuidance.push('Check in with elderly family members and neighbors who may need assistance.');
  } else {
    status = 'SAFE';
    urgency = 'Low';
    actionSummary = 'No active flood threat detected in your immediate perimeter.';
    detailedGuidance.push('Review your household emergency kit periodically.');
    detailedGuidance.push('Know your local shelter locations before severe weather arrives.');
  }

  // Calculate confidence based on data completeness
  let confidence = 65;
  if (riverDischarge) confidence += 15;
  if (rainfall) confidence += 10;
  if (sensor && sensor.status !== 'FAULT') confidence += 10;
  if (isStale) confidence = Math.max(40, confidence - 25);

  return {
    status,
    urgency,
    confidencePercentage: Math.min(98, confidence),
    lastUpdated: lastFetchTimestamp,
    isStale,
    staleReason,
    actionSummary,
    detailedGuidance,
    factors: {
      riverDischargeRisk: Math.round(riverScore),
      rainfallRisk: Math.round(rainScore),
      elevationVulnerability: Math.round(elevationVulnerability),
      sensorAlertLevel: Math.round(sensorAlertLevel),
      communityReportCount,
    },
  };
}
