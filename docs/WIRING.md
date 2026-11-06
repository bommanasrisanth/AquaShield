# ESP32 Flood Sensor Hardware Wiring & Assembly Guide

FloodGuard interfaces with low-cost, waterproof ultrasonic sensor nodes built on the ESP32 microcontroller.

---

## 1. Bill of Materials (BOM)

| Component | Specification | Estimated Cost | Purpose |
| :--- | :--- | :--- | :--- |
| **Microcontroller** | ESP32-WROOM-32 (NodeMCU / DevKit) | $3.50 | Telemetry processing, alarm logic, serial/BLE |
| **Ultrasonic Sensor** | JSN-SR04T / AJ-SR04M Waterproof | $4.20 | Measuring water surface distance (20cm - 450cm) |
| **Piezobuzzer** | Active 5V / 3.3V High-Decibel Buzzer | $0.60 | Local audible evacuation alarm |
| **Battery** | 18650 Li-Ion 3.7V (2600mAh) + Solar Board | $4.50 | Autonomous offline field power |
| **Resistors** | 2x 100kΩ 1% Metal Film | $0.10 | Battery voltage divider for ADC reading |
| **Enclosure** | IP67 Waterproof Junction Box | $3.00 | Housing electronics outdoors |

---

## 2. Wiring Connections

```
      ESP32 DevKit                  JSN-SR04T Transceiver Board
   +----------------+                   +------------------+
   |             5V |-------------------| 5V               |
   |            GND |-------------------| GND              |
   |         GPIO 5 |-------------------| TRIG             |
   |        GPIO 18 |-------------------| ECHO             |
   +----------------+                   +------------------+

      ESP32 DevKit                        Active Piezobuzzer
   +----------------+                   +------------------+
   |        GPIO 19 |-------------------| (+) Positive Pin |
   |            GND |-------------------| (-) Negative Pin |
   +----------------+                   +------------------+

      ESP32 DevKit                        Battery Monitor Divider
   +----------------+
   |        GPIO 34 |<-----+ 100kΩ Resistor <--- LiPo Battery (+)
   |            GND |<-----+ 100kΩ Resistor <--- Ground / Negative
   +----------------+
```

---

## 3. Transducer Mounting Guidelines

1. **Mounting Height**: Secure the ultrasonic transducer face downwards at a fixed distance (e.g., 200–250 cm) above the riverbed or canal floor on a bridge abutment or culvert post.
2. **Clear Cone**: Maintain a 45-degree obstacle-free cone beneath the sensor face to avoid stray echoes from bridge pilings or vegetation.
3. **Waterproof Seal**: Mount the electronics board inside an IP67 enclosure above maximum anticipated historical crest level.
