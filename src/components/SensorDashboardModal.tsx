/**
 * IoT Sensor Network Dashboard Modal — Aesthetic White Edition
 * Interfaces with ESP32 microcontrollers via Web Serial and Web Bluetooth.
 * Clean, tactile, easy to understand.
 */

import React, { useState, useEffect } from 'react';
import { SensorReading } from '../types';
import { esp32Serial, SerialConnectionStatus } from '../sensors/esp32Serial';
import { esp32Bluetooth } from '../sensors/esp32Bluetooth';
import { sensorSimulator, SimulatorState } from '../sensors/sensorSimulator';

interface SensorDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeReading: SensorReading | null;
  onReadingUpdate: (reading: SensorReading) => void;
}

export const SensorDashboardModal: React.FC<SensorDashboardModalProps> = ({
  isOpen,
  onClose,
  activeReading,
  onReadingUpdate,
}) => {
  const [serialStatus, setSerialStatus] = useState<SerialConnectionStatus>({
    isSupported: esp32Serial.isSupported(),
    isConnected: false,
  });

  const [bleStatus, setBleStatus] = useState<{ isConnected: boolean; name?: string; error?: string }>({
    isConnected: false,
  });

  const [simState, setSimState] = useState<SimulatorState>(sensorSimulator.getState());
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    sensorSimulator.start(1500);

    const unsubSim = sensorSimulator.subscribe((reading, state) => {
      setSimState(state);
      onReadingUpdate(reading);
      setHistory((prev) => [...prev.slice(-20), reading.waterLevelCm]);
    });

    esp32Serial.setCallbacks(
      (reading) => {
        onReadingUpdate(reading);
        setHistory((prev) => [...prev.slice(-20), reading.waterLevelCm]);
      },
      (status) => setSerialStatus(status)
    );

    esp32Bluetooth.setCallbacks(
      (reading) => {
        onReadingUpdate(reading);
        setHistory((prev) => [...prev.slice(-20), reading.waterLevelCm]);
      },
      (status) => setBleStatus(status)
    );

    return () => {
      unsubSim();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const reading = activeReading || {
    id: 'placeholder',
    sensorId: 'ESP32_NODE_01',
    timestamp: Date.now(),
    waterLevelCm: 45,
    baselineCm: 25,
    rateOfRiseCmPerHour: 0.5,
    batteryPercentage: 88,
    status: 'NORMAL',
    rawDistanceCm: 205,
    filteredDistanceCm: 205,
  };

  const handleConnectSerial = async () => {
    await esp32Serial.connect();
  };

  const handleConnectBluetooth = async () => {
    await esp32Bluetooth.connect();
  };

  const handleTriggerBuzzer = async () => {
    await esp32Serial.sendCommand('BUZZER_ON');
  };

  const getStatusBadge = (status: SensorReading['status']) => {
    if (status === 'CRITICAL')
      return {
        card: 'bg-rose-50/60 border-rose-300 text-rose-950',
        badge: 'bg-rose-600 text-white',
        text: 'CRITICAL RISE',
      };
    if (status === 'ELEVATED')
      return {
        card: 'bg-amber-50/60 border-amber-300 text-amber-950',
        badge: 'bg-amber-500 text-white',
        text: 'ELEVATED',
      };
    if (status === 'FAULT')
      return {
        card: 'bg-purple-50/60 border-purple-300 text-purple-950',
        badge: 'bg-purple-600 text-white',
        text: 'SENSOR FAULT',
      };
    return {
      card: 'bg-emerald-50/60 border-emerald-300 text-emerald-950',
      badge: 'bg-emerald-500 text-white',
      text: 'NORMAL LEVEL',
    };
  };

  const statusStyle = getStatusBadge(reading.status);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="IoT Sensor Dashboard"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl h-[88vh] max-h-[740px] bg-white border border-slate-200/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-xs border border-sky-100">
              📟
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">ESP32 Flood Sensor Network</h2>
              <p className="text-xs text-slate-500">Ultrasonic Water-Level Gauge • Autonomous Local Alarm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fafbfc]">
          {/* Main Gauges: Water Level, Rate of Rise, Battery */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Water Level Gauge */}
            <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-xs transition ${statusStyle.card}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Water Depth
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
                  {statusStyle.text}
                </span>
              </div>
              <div className="text-4xl font-black mt-2 text-slate-900 tracking-tight">
                {reading.waterLevelCm} <span className="text-lg font-semibold text-slate-500">cm</span>
              </div>
              <div className="text-xs text-slate-500 mt-1.5 font-medium">
                Baseline depth: {reading.baselineCm} cm
              </div>
            </div>

            {/* Rate of Rise Gauge */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Rate of Rise
              </span>
              <div className="text-4xl font-black mt-2 text-slate-900 tracking-tight">
                {reading.rateOfRiseCmPerHour > 0 ? `+${reading.rateOfRiseCmPerHour}` : reading.rateOfRiseCmPerHour}
                <span className="text-xs font-semibold text-slate-400 ml-1.5">cm/hr</span>
              </div>
              <div className="text-xs text-slate-500 mt-1.5 font-medium">
                {reading.rateOfRiseCmPerHour >= 15 ? (
                  <span className="text-rose-600 font-bold">⚠️ Flash Flood Surge Spike</span>
                ) : (
                  <span>Normal stream velocity</span>
                )}
              </div>
            </div>

            {/* Battery Gauge */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Battery Cell
              </span>
              <div className="text-4xl font-black mt-2 text-slate-900 tracking-tight">
                {reading.batteryPercentage}%
              </div>
              <div className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                <span>⚡</span>
                <span>Solar LiPo Float Ready</span>
              </div>
            </div>
          </div>

          {/* Fault Indicator */}
          {reading.status === 'FAULT' && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 font-medium">
              <strong>Sensor Fault Detected:</strong> {reading.faultReason || 'Transducer echo out of calibration range.'}
            </div>
          )}

          {/* Historical Trend Sparkline */}
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider">
                Live Sensor History (Last 20 Readings)
              </span>
              <span className="text-slate-400 font-medium">Interval: 1.5s</span>
            </div>

            <div className="h-20 flex items-end gap-1.5 pt-2 border-b border-slate-100 px-1 bg-slate-50/50 rounded-xl">
              {history.map((val, idx) => {
                const heightPct = Math.min(100, Math.max(12, (val / 200) * 100));
                return (
                  <div
                    key={idx}
                    style={{ height: `${heightPct}%` }}
                    className={`flex-1 rounded-t-md transition-all duration-300 ${
                      val >= 150
                        ? 'bg-rose-500'
                        : val >= 90
                          ? 'bg-amber-400'
                          : 'bg-blue-500'
                    }`}
                    title={`${val} cm`}
                  ></div>
                );
              })}
            </div>
          </div>

          {/* Physical Microcontroller Connection Bar */}
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3.5 shadow-xs">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hardware Microcontroller Connect
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct physical connection over USB-C or Bluetooth</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleConnectSerial}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-xs ${
                  serialStatus.isConnected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span>🔌</span>
                <span>
                  {serialStatus.isConnected
                    ? 'Connected (Web Serial 115200 Baud)'
                    : 'Connect USB Serial (ESP32)'}
                </span>
              </button>

              <button
                onClick={handleConnectBluetooth}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-xs ${
                  bleStatus.isConnected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span>📶</span>
                <span>
                  {bleStatus.isConnected ? 'Connected via BLE' : 'Connect Bluetooth (BLE UART)'}
                </span>
              </button>

              <button
                onClick={handleTriggerBuzzer}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition"
              >
                <span>📢</span>
                <span>Test Hardware Buzzer</span>
              </button>
            </div>

            {serialStatus.error && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                {serialStatus.error}
              </p>
            )}
          </div>

          {/* Demonstration Simulator Controls */}
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧪</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Demonstration Simulator (Live Testing)
                </h3>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 font-semibold flex justify-between">
                <span>Adjust Simulated Water Depth:</span>
                <strong className="text-blue-600 font-black">{Math.round(simState.waterLevelCm)} cm</strong>
              </label>
              <input
                type="range"
                min="10"
                max="220"
                value={simState.waterLevelCm}
                onChange={(e) => sensorSimulator.setWaterLevel(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Normal (25cm)</span>
                <span>Elevated (90cm)</span>
                <span>Critical / Siren (150cm+)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => sensorSimulator.toggleRain()}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs ${
                  simState.isRaining
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {simState.isRaining ? '🌧️ Torrential Rain: ON' : '☀️ Torrential Rain: OFF'}
              </button>

              <button
                onClick={() =>
                  sensorSimulator.setFault(simState.hasFault ? false : 'BLIND_ZONE')
                }
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs ${
                  simState.hasFault
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {simState.hasFault ? '⚠️ Fault Injected' : 'Simulate Sensor Fault'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center font-medium">
          The physical ESP32 firmware monitors water levels and sounds its piercing piezobuzzer locally even if disconnected from computers or internet.
        </div>
      </div>
    </div>
  );
};
