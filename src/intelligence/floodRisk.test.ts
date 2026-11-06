import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFloodRisk } from './floodRisk';

test('calculateFloodRisk returns SAFE under normal dry conditions', () => {
  const result = calculateFloodRisk({
    riverDischarge: {
      currentDischargeM3s: 15,
      historicalMeanM3s: 20,
      historicalMaxM3s: 200,
      rateOfRisePerHour: 0,
      dischargeThresholdM3s: 100,
      isSpike: false,
    },
    rainfall: {
      rainLast1HourMm: 0,
      rainLast24HoursMm: 2,
      rainForecastNext24HoursMm: 5,
      rainIntensity: 'none',
    },
    elevationMeters: 45,
    communityReportCount: 0,
  });

  assert.equal(result.status, 'SAFE');
  assert.equal(result.urgency, 'Low');
  assert.equal(result.isStale, false);
});

test('calculateFloodRisk elevates to LEAVE NOW when river discharge and rainfall spike', () => {
  const result = calculateFloodRisk({
    riverDischarge: {
      currentDischargeM3s: 350,
      historicalMeanM3s: 50,
      historicalMaxM3s: 300,
      rateOfRisePerHour: 65,
      dischargeThresholdM3s: 200,
      isSpike: true,
    },
    rainfall: {
      rainLast1HourMm: 45,
      rainLast24HoursMm: 160,
      rainForecastNext24HoursMm: 80,
      rainIntensity: 'torrential',
    },
    elevationMeters: 4,
    communityReportCount: 4,
  });

  assert.equal(result.status, 'LEAVE NOW');
  assert.equal(result.urgency, 'Immediate Life Threat');
  assert.ok(result.actionSummary.toLowerCase().includes('evacuate') || result.actionSummary.toLowerCase().includes('higher ground'));
});

test('calculateFloodRisk handles offline mode with stale warning and local sensor override', () => {
  const result = calculateFloodRisk({
    isOffline: true,
    elevationMeters: 10,
    sensor: {
      id: 'sensor-01',
      sensorId: 'ESP32_KRISHNA_01',
      timestamp: Date.now(),
      waterLevelCm: 85,
      baselineCm: 20,
      rateOfRiseCmPerHour: 18,
      batteryPercentage: 92,
      status: 'CRITICAL',
      rawDistanceCm: 15,
      filteredDistanceCm: 15,
    },
  });

  assert.equal(result.isStale, true);
  assert.ok(result.staleReason?.includes('offline'));
  // Critical IoT sensor overrides to trigger life-saving response
  assert.equal(result.status, 'LEAVE NOW');
});
