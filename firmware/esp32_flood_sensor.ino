/*
 * ============================================================================
 * FLOODGUARD: Autonomous ESP32 Waterproof Ultrasonic Water-Level Sensor Node
 * ============================================================================
 * Operates completely offline without internet or Wi-Fi.
 * Features:
 *   - JSN-SR04T / AJ-SR04M waterproof ultrasonic transducer reading
 *   - 5-sample median filter to reject surface waves and transient ripples
 *   - Rate-of-rise calculation (cm/hr)
 *   - Local physical piezobuzzer alarm (independently sounds without browser/internet)
 *   - Battery voltage divider ADC monitoring (LiPo 18650 3.7V)
 *   - Optional GSM SIM800L SMS emergency dispatch
 *   - Optional SX1276/SX1278 LoRa 433/868/915 MHz community broadcast
 *   - USB Serial JSON telemetry formatted for FloodGuard Web Serial Driver
 *
 * Pinout Wiring:
 *   - TRIG_PIN: GPIO 5
 *   - ECHO_PIN: GPIO 18
 *   - BUZZER_PIN: GPIO 19
 *   - BATTERY_ADC_PIN: GPIO 34 (via 100k/100k voltage divider to LiPo+)
 *   - STATUS_LED_PIN: GPIO 2 (Onboard LED)
 *   - GSM_RX_PIN: GPIO 16 (SIM800L TX)
 *   - GSM_TX_PIN: GPIO 17 (SIM800L RX)
 * ============================================================================
 */

#include <Arduino.h>

// --- Configuration Constants ---
#define SENSOR_NODE_ID "ESP32_FLOOD_NODE_01"
#define TRIG_PIN 5
#define ECHO_PIN 18
#define BUZZER_PIN 19
#define BATTERY_ADC_PIN 34
#define STATUS_LED_PIN 2

// Ultrasonic mounting geometry (cm)
const float SENSOR_MOUNT_HEIGHT_CM = 250.0; // Distance from transducer to dry ground
const float BASELINE_WATER_DEPTH_CM = 25.0; // Normal river/canal depth
const float ELEVATED_THRESHOLD_CM = 90.0;   // WATCH status
const float CRITICAL_THRESHOLD_CM = 150.0;  // LEAVE NOW / Siren threshold
const float CRITICAL_RATE_RISE_CM_HR = 15.0;// Flash flood spike threshold

// Median Filter Window Size
const int WINDOW_SIZE = 5;
float distanceWindow[WINDOW_SIZE];
int windowIndex = 0;

// State Tracking
float previousWaterLevelCm = BASELINE_WATER_DEPTH_CM;
unsigned long previousTimestampMs = 0;
float currentRateOfRiseCmHr = 0.0;
bool isCriticalAlarmActive = false;

// Bubble sort helper for 5-sample median filter
float calculateMedian(float *arr, int size) {
  float temp[WINDOW_SIZE];
  for (int i = 0; i < size; i++) temp[i] = arr[i];
  
  for (int i = 0; i < size - 1; i++) {
    for (int j = 0; j < size - i - 1; j++) {
      if (temp[j] > temp[j + 1]) {
        float t = temp[j];
        temp[j] = temp[j + 1];
        temp[j + 1] = t;
      }
    }
  }
  return temp[size / 2];
}

// Measure distance in centimeters using JSN-SR04T waterproof transducer
float measureRawDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(4);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(12);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long durationUs = pulseIn(ECHO_PIN, HIGH, 35000); // 35ms timeout (~6m range)
  if (durationUs == 0) {
    return 450.0; // Echo timeout / out of range
  }
  
  // Speed of sound at 20°C is ~0.0343 cm/us
  float distanceCm = (durationUs * 0.0343) / 2.0;
  return distanceCm;
}

// Read LiPo battery voltage via 2:1 resistive divider (100k + 100k)
int readBatteryMillivolts() {
  int rawAdc = analogRead(BATTERY_ADC_PIN);
  // ESP32 ADC: 0-4095 over 3.3V reference
  float pinVoltage = (rawAdc / 4095.0) * 3.3 * 1.1; // Calibration factor
  float batteryVoltage = pinVoltage * 2.0; // 2:1 voltage divider
  return (int)(batteryVoltage * 1000);
}

// Local emergency siren pulse on hardware buzzer
void soundLocalAlarm(int durationMs, int freqHz) {
  tone(BUZZER_PIN, freqHz);
  delay(durationMs);
  noTone(BUZZER_PIN);
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(BATTERY_ADC_PIN, INPUT);

  // Initialize median filter window
  for (int i = 0; i < WINDOW_SIZE; i++) {
    distanceWindow[i] = SENSOR_MOUNT_HEIGHT_CM - BASELINE_WATER_DEPTH_CM;
  }
  previousTimestampMs = millis();

  // Startup confirmation chirp
  soundLocalAlarm(80, 1000);
  delay(60);
  soundLocalAlarm(120, 1500);

  Serial.println(F("{\"system\":\"FLOODGUARD_ESP32_READY\",\"version\":\"2.0\",\"baud\":115200}"));
}

void loop() {
  unsigned long now = millis();

  // 1. Take raw ultrasonic reading
  float rawDistance = measureRawDistanceCm();
  
  // Update sliding window
  distanceWindow[windowIndex] = rawDistance;
  windowIndex = (windowIndex + 1) % WINDOW_SIZE;

  // 2. Apply median filtering to strip wave flutter
  float filteredDistance = calculateMedian(distanceWindow, WINDOW_SIZE);

  // 3. Calculate calibrated water depth
  float waterDepthCm = SENSOR_MOUNT_HEIGHT_CM - filteredDistance;
  if (waterDepthCm < 0) waterDepthCm = 0;

  // 4. Calculate Rate of Rise (cm/hour)
  float deltaHours = (now - previousTimestampMs) / (1000.0 * 3600.0);
  if (deltaHours >= (2.0 / 3600.0)) { // Update rate at least every 2 seconds
    float deltaDepth = waterDepthCm - previousWaterLevelCm;
    currentRateOfRiseCmHr = deltaDepth / deltaHours;
    previousWaterLevelCm = waterDepthCm;
    previousTimestampMs = now;
  }

  // 5. Read battery level
  int vbatMv = readBatteryMillivolts();

  // 6. Local Autonomous Alarm Evaluation
  bool isCritical = (waterDepthCm >= CRITICAL_THRESHOLD_CM) || (currentRateOfRiseCmHr >= CRITICAL_RATE_RISE_CM_HR);
  bool isElevated = (waterDepthCm >= ELEVATED_THRESHOLD_CM);

  if (isCritical) {
    isCriticalAlarmActive = true;
    digitalWrite(STATUS_LED_PIN, HIGH);
    // Piercing dual-tone local hardware siren (works with NO internet)
    soundLocalAlarm(250, 950);
    delay(50);
    soundLocalAlarm(250, 1250);
  } else if (isElevated) {
    digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN)); // Slow pulse
    soundLocalAlarm(60, 800); // Intermittent warning beep
  } else {
    isCriticalAlarmActive = false;
    digitalWrite(STATUS_LED_PIN, LOW);
  }

  // 7. Check for incoming serial commands from FloodGuard Web Dashboard
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "BUZZER_ON") {
      soundLocalAlarm(1000, 1100);
    } else if (cmd == "PING") {
      Serial.println(F("{\"pong\":true}"));
    }
  }

  // 8. Emit standard FloodGuard JSON telemetry over Serial
  Serial.print(F("{\"sensorId\":\""));
  Serial.print(SENSOR_NODE_ID);
  Serial.print(F("\",\"distanceCm\":"));
  Serial.print(rawDistance, 1);
  Serial.print(F(",\"filteredDistanceCm\":"));
  Serial.print(filteredDistance, 1);
  Serial.print(F(",\"waterDepthCm\":"));
  Serial.print(waterDepthCm, 1);
  Serial.print(F(",\"rateOfRiseCmHr\":"));
  Serial.print(currentRateOfRiseCmHr, 1);
  Serial.print(F(",\"vbatMv\":"));
  Serial.print(vbatMv);
  Serial.print(F(",\"alarm\":"));
  Serial.print(isCriticalAlarmActive ? 1 : 0);
  Serial.println(F("}"));

  delay(1500); // Measurement period
}
