# FloodGuard Test Plan & Verification Procedures

This document details test coverage across global test environments, offline survival modes, and sensor edge cases.

---

## 1. Global Presets Verification

| Location | Coordinates | Primary Hazard Checked | Expected Baseline |
| :--- | :--- | :--- | :--- |
| **Vijayawada, India** | 16.5062° N, 80.6480° E | Krishna river surge / Prakasam barrage discharge | Elevated water watch; cyclone shelters active |
| **Kathmandu, Nepal** | 27.7172° N, 85.3240° E | Bagmati river flash runoff & valley inundation | Stadium high grounds; monsoon watch |
| **Dhaka, Bangladesh** | 23.8103° N, 90.4125° E | Buriganga / Meghna delta low-lying waterlogging | Relief centers; high population density |
| **Houston, USA** | 29.7604° N, -95.3698° W | Bayou drainage overflow & hurricane storm surges | Mega-shelters (GRB); FEMA integration |
| **Nairobi, Kenya** | -1.2921° S, 36.8219° E | Nairobi River basin sudden flash flooding | Red Cross rescue coordination |

---

## 2. Emergency Operational Testing

### Mode C: Complete Offline Test
1. Click **"Mode A (Online)"** in the top navigation bar to toggle **"Mode C (Offline)"**.
2. Verify banner display: *"Internet and mobile network unavailable. Current flood conditions cannot be verified..."*
3. Verify that:
   - Previously cached shelters and elevation estimates remain fully visible.
   - Emergency Ready checklist can be updated and saved to IndexedDB.
   - Offline SOS SMS link is generated with coordinates.
   - Speech synthesis / audible alert reads out the emergency warning.

### IoT Sensor Simulation Test
1. Open the **IoT Sensors** tab.
2. Drag the simulated water level slider to `175 cm` (above critical threshold).
3. Verify:
   - Water gauge badge turns red `CRITICAL`.
   - Rate of rise indicates flash flood spike.
   - Dashboard status automatically elevates to `LEAVE NOW`.

### Multilingual & RTL Test
1. Switch language to **العربية (Arabic)**.
2. Verify that `dir="rtl"` is activated on the application shell.
3. Switch to **Telugu (తెలుగు)** or **Hindi (हिन्दी)** and click **HEAR ALERT** to verify speech synthesis voice tags and text captions.
