# FloodGuard

> **Global AI-Powered Flood Intelligence, Life-Saving & Offline Emergency Response System**

FloodGuard is a lightweight, accessible, offline-first flood monitoring and disaster response web application designed to save lives across vulnerable communities worldwide.

---

## 🌊 Key Capabilities

1. **Simple Citizen Dashboard**: Displays flood severity (`SAFE`, `WATCH`, `PREPARE`, `LEAVE NOW`), immediate actionable instructions, four prominent life-saving buttons (`HEAR ALERT`, `SOS`, `CALL HELPLINE`, `SHARE LOCATION`), and high-ground nearby shelter maps.
2. **Extreme Offline Capability (Mode C)**: Operates seamlessly without internet or cellular connectivity using IndexedDB, Service Workers, Web Audio sirens, offline checklists, and local ESP32 sensor processing.
3. **Multi-Source Flood Intelligence Engine**: Combines Open-Meteo Flood API (river discharge, rate of rise), Open-Meteo Weather API (hourly & 24h precipitation), elevation differentials, and local IoT sensors.
4. **Smart SafePlace Evacuation**: Identifies verified shelters, compares ground elevations, computes realistic road travel times (not naive straight-line distance), and provides turn-by-turn navigation.
5. **Personal Emergency Companion**: Voice and text safety assistant powered by Gemini AI when online, instantly backed by medically and disaster-management reviewed offline safety guidance when offline.
6. **Family Safety Network**: Save up to 3 emergency contacts, common meeting points, one-tap check-in, and offline SMS emergency generators.
7. **Community Flood Radar**: Citizen-reported flood hazards with photo uploads, deduplication clustering, and offline sync queue.
8. **Low-Cost IoT Water Sensor Network**: Web Serial and Web Bluetooth drivers for ESP32 microcontrollers, live sensor dashboard, and interactive simulation.
9. **Emergency Ready Checklist**: 72-hour survival kit checklist, drinking water disinfection protocols (boiling & chlorination), first-aid guides, and household readiness score.
10. **12 Languages with Voice Alerts & RTL**: English, Hindi, Telugu, Tamil, Nepali, Bengali, Spanish, French, Arabic (RTL), Portuguese, Indonesian, and Swahili.
11. **Authorities Console**: OASIS CAP 1.2 XML/JSON broadcast generator and telecom Cell Broadcast SMS formatter.

---

## 🚀 Quick Start

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/floodguard.git
cd floodguard

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for Gemini AI companion)
cp .env.example .env

# 4. Start local development server
npm run dev
```

Open `http://localhost:3000` in your web browser.

### Running Unit Tests

```bash
npx --yes tsx --test src/intelligence/floodRisk.test.ts
npx --yes tsx --test src/sensors/sensorLogic.test.ts
npx --yes tsx --test src/alerts/capGenerator.test.ts
```

### Production Build

```bash
npm run build
npm run start
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript (Strict Mode), Vite 8, Tailwind CSS v4, Motion
- **Mapping**: Leaflet & OpenStreetMap (with offline fallback canvas)
- **Offline Storage**: Native IndexedDB (`FloodGuardDB`) & Cache Storage
- **Hardware Integration**: Web Serial API, Web Bluetooth API (BLE UART)
- **Audio & Voice**: Web Audio API (synthesized dual-tone siren) & Web Speech API (SpeechSynthesis)
- **AI Backend**: `@google/genai` (Server-side proxy with Gemini 3.8 Flash)
- **Firmware**: Arduino C++ for ESP32 with JSN-SR04T waterproof ultrasonic transducer

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
