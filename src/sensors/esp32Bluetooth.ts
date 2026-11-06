/**
 * ESP32 Web Bluetooth Low Energy (BLE) Driver
 * Nordic UART Service (NUS) compatible telemetry receiver.
 */

import { SensorReading } from '../types';
import { processSensorPacket, DEFAULT_SENSOR_CONFIG } from './sensorLogic';

export const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const NUS_RX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // Write
export const NUS_TX_CHAR_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Notify

export class ESP32BluetoothDriver {
  private device: any = null;
  private server: any = null;
  private txCharacteristic: any = null;
  private rxCharacteristic: any = null;
  private window: number[] = [];
  private lastReading: SensorReading | null = null;
  private onReadingCallback: ((reading: SensorReading) => void) | null = null;
  private onStatusChangeCallback: ((status: { isConnected: boolean; name?: string; error?: string }) => void) | null = null;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public setCallbacks(
    onReading: (reading: SensorReading) => void,
    onStatusChange: (status: { isConnected: boolean; name?: string; error?: string }) => void
  ) {
    this.onReadingCallback = onReading;
    this.onStatusChangeCallback = onStatusChange;
  }

  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      this.onStatusChangeCallback?.({
        isConnected: false,
        error: 'Web Bluetooth is not supported in this browser.',
      });
      return false;
    }

    try {
      const nav = navigator as any;
      this.device = await nav.bluetooth.requestDevice({
        filters: [{ namePrefix: 'AquaShield' }, { namePrefix: 'FloodGuard' }, { namePrefix: 'ESP32' }],
        optionalServices: [NUS_SERVICE_UUID],
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.onStatusChangeCallback?.({ isConnected: false });
      });

      this.server = await this.device.gatt.connect();
      const service = await this.server.getPrimaryService(NUS_SERVICE_UUID);
      this.txCharacteristic = await service.getCharacteristic(NUS_TX_CHAR_UUID);
      this.rxCharacteristic = await service.getCharacteristic(NUS_RX_CHAR_UUID);

      await this.txCharacteristic.startNotifications();
      this.txCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(value);
        try {
          const data = JSON.parse(text);
          if (data.distanceCm !== undefined) {
            const { reading, updatedWindow } = processSensorPacket(
              {
                rawDistanceCm: Number(data.distanceCm),
                batteryMillivolts: data.vbatMv ? Number(data.vbatMv) : undefined,
                sensorId: data.sensorId || 'ESP32_BLE',
              },
              this.window,
              this.lastReading,
              DEFAULT_SENSOR_CONFIG
            );
            this.window = updatedWindow;
            this.lastReading = reading;
            this.onReadingCallback?.(reading);
          }
        } catch (_) {}
      });

      this.onStatusChangeCallback?.({
        isConnected: true,
        name: this.device.name || 'ESP32 Flood Sensor',
      });
      return true;
    } catch (err: any) {
      console.warn('Bluetooth connection error:', err);
      this.onStatusChangeCallback?.({
        isConnected: false,
        error: err?.message || 'Bluetooth connection failed',
      });
      return false;
    }
  }

  public async disconnect() {
    try {
      if (this.device && this.device.gatt.connected) {
        this.device.gatt.disconnect();
      }
    } catch (_) {}
    this.device = null;
    this.server = null;
    this.onStatusChangeCallback?.({ isConnected: false });
  }
}

export const esp32Bluetooth = new ESP32BluetoothDriver();
