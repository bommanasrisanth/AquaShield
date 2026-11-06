import test from 'node:test';
import assert from 'node:assert/strict';
import {
  medianFilter,
  millivoltsToPercentage,
  calculateRateOfRise,
  validateSensorDistance,
  processSensorPacket,
  DEFAULT_SENSOR_CONFIG,
} from './sensorLogic';

test('medianFilter removes extreme transient noise', () => {
  const windowWithGlitch = [150, 151, 999, 149, 152];
  const filtered = medianFilter(windowWithGlitch);
  assert.equal(filtered, 151);
});

test('millivoltsToPercentage maps voltages correctly', () => {
  assert.equal(millivoltsToPercentage(4200), 100);
  assert.equal(millivoltsToPercentage(3000), 0);
  assert.equal(millivoltsToPercentage(3600), 50);
});

test('calculateRateOfRise computes cm/hr accurately', () => {
  const t1 = 1000000000;
  const t2 = t1 + (30 * 60 * 1000); // 30 minutes later
  const rate = calculateRateOfRise(40, t1, 55, t2); // +15cm in 0.5hr = 30cm/hr
  assert.equal(rate, 30);
});

test('validateSensorDistance detects blind zones and out-of-range echoes', () => {
  assert.equal(validateSensorDistance(1.5).isValid, false);
  assert.equal(validateSensorDistance(480).isValid, false);
  assert.equal(validateSensorDistance(120).isValid, true);
});

test('processSensorPacket generates calibrated CRITICAL status on dangerous water rise', () => {
  // Sensor mount = 250cm. Distance = 70cm -> water level = 180cm (above 150cm critical threshold)
  const result = processSensorPacket(
    { rawDistanceCm: 70, batteryMillivolts: 3950 },
    [70, 70, 70],
    null,
    DEFAULT_SENSOR_CONFIG
  );

  assert.equal(result.reading.waterLevelCm, 180);
  assert.equal(result.reading.status, 'CRITICAL');
  assert.ok(result.reading.batteryPercentage > 70);
});
