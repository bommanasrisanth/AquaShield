# FloodGuard Architecture & System Design

FloodGuard is designed around a life-saving, offline-first paradigm. It prioritizes clarity, performance on low-end smartphones, accessibility for diverse populations, and autonomous functionality when telecommunication networks collapse.

---

## 1. Operating Modes

### Mode A: Online
- **Active Data Sources**: Live Open-Meteo Flood API (river discharge, return periods), Open-Meteo Weather API (hourly precipitation, 24h accumulation), OpenStreetMap Overpass (geographic facilities), Gemini AI (natural language safety companion).
- **Behavior**: Retrieves real-time flood models, checks official warnings, synchronizes crowdsourced observations, stores responses in local IndexedDB.

### Mode B: Limited Connectivity
- **Behavior**: Throttles non-essential polling, utilizes cached river discharge baselines, displays precise timestamp of last successful verification, queues user reports for background synchronization.

### Mode C: Complete Offline & No Mobile Signal
- **Crucial Safety Assertion**: *"Internet and mobile network unavailable. Current flood conditions cannot be verified. Your saved emergency information and local safety tools are available."*
- **Active Capabilities**:
  - Full application launch from Cache Storage / PWA.
  - Interactive Leaflet map with cached vector landmarks and emergency fallback radar.
  - Verified shelter directory with elevation differentials and realistic road travel times.
  - Native IndexedDB access to 72-hour survival checklists, water disinfection guides, and flood first aid.
  - Real-time connection to ESP32 ultrasonic water-level sensors via Web Serial & Web Bluetooth.
  - Dual-tone Web Audio synthesized emergency siren (operates with zero audio asset downloads).
  - Screen strobe for night search-and-rescue signaling.
  - 1-touch offline SMS broadcast URL generator with GPS coordinates.
  - Emergency companion powered by medically reviewed offline rulebase.

---

## 2. Multi-Source Flood Intelligence Engine

FloodGuard decouples physical hazard severity from human response urgency:
1. **River Discharge ($Q$)**: Computes ratio of current discharge to bankfull threshold ($Q / Q_{\text{threshold}}$) and rate of rise ($dQ/dt$).
2. **Precipitation ($P$)**: Evaluates 1-hour peak intensity (flash flood trigger) and 24-hour antecedent rainfall.
3. **Topographic Elevation ($E$)**: Assesses elevation relative to local water bodies.
4. **Local IoT Sensor Telemetry**: Autonomous ultrasonic readings take precedence over regional meteorological forecasts.
5. **Community Verification Engine**: Aggregates crowdsourced incident markers with deduplication clustering.

```
+-------------------------------------------------------------+
|                     Data Ingestion                          |
|  [Open-Meteo Flood]  [Open-Meteo Weather]  [ESP32 Hardware]  |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                Flood Risk Intelligence Engine               |
|      Composite Score = f(Q_river, P_rain, E_elev, Sensor)   |
|          Calculates: Urgency, Freshness, & Action           |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                  Simple Citizen Dashboard                   |
|     1. Flood Status (SAFE | WATCH | PREPARE | LEAVE NOW)    |
|     2. What User Should Do Now                              |
|     3. Action Buttons (Hear Alert, SOS, Helpline, Location) |
|     4. High-Ground Nearby Map                               |
|     5. Freshness & Connectivity Timestamp                   |
+-------------------------------------------------------------+
```

---

## 3. Storage & Privacy Architecture

- **No Mandatory Login**: Citizens require immediate access without login friction or credential barriers.
- **Client-authoritative Storage**: All emergency contacts, check-ins, and checklists reside in client-side IndexedDB (`FloodGuardDB`).
- **Store-and-Forward**: Unsynced check-ins and incident reports are stored in local queues and synchronized when connectivity returns.
- **Delete-My-Data**: Immediate 1-click purge of all client records and caches.
