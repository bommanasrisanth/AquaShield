/**
 * ESP32 Web Serial API Driver
 * Connects directly to hardware ESP32 microcontrollers over USB-C / UART.
 * Reads JSON telemetry stream and sends buzzer trigger commands.
 */

import { SensorReading } from '../types';
import { processSensorPacket, DEFAULT_SENSOR_CONFIG } from './sensorLogic';

export interface SerialConnectionStatus {
  isSupported: boolean;
  isConnected: boolean;
  portName?: string;
  error?: string;
}

export class ESP32SerialDriver {
  private port: any = null;
  private reader: any = null;
  private isReading = false;
  private window: number[] = [];
  private lastReading: SensorReading | null = null;
  private onReadingCallback: ((reading: SensorReading) => void) | null = null;
  private onStatusChangeCallback: ((status: SerialConnectionStatus) => void) | null = null;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public setCallbacks(
    onReading: (reading: SensorReading) => void,
    onStatusChange: (status: SerialConnectionStatus) => void
  ) {
    this.onReadingCallback = onReading;
    this.onStatusChangeCallback = onStatusChange;
  }

  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      this.onStatusChangeCallback?.({
        isSupported: false,
        isConnected: false,
        error: 'Web Serial API is not supported in this browser. Use Chrome/Edge or the Simulator.',
      });
      return false;
    }

    try {
      const nav = navigator as any;
      this.port = await nav.serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      this.isReading = true;
      this.onStatusChangeCallback?.({
        isSupported: true,
        isConnected: true,
        portName: 'ESP32 Flood Sensor (COM/ttyUSB)',
      });

      this.startReadLoop();
      return true;
    } catch (err: any) {
      console.warn('Web Serial connection cancelled or failed:', err);
      this.onStatusChangeCallback?.({
        isSupported: true,
        isConnected: false,
        error: err?.message || 'Device connection cancelled',
      });
      return false;
    }
  }

  private async startReadLoop() {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    this.reader = reader;

    let buffer = '';

    try {
      while (this.isReading) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
              try {
                const data = JSON.parse(trimmed);
                if (data.distanceCm !== undefined) {
                  const { reading, updatedWindow } = processSensorPacket(
                    {
                      rawDistanceCm: Number(data.distanceCm),
                      batteryMillivolts: data.vbatMv ? Number(data.vbatMv) : undefined,
                      sensorId: data.sensorId || 'ESP32_HARDWARE',
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
            }
          }
        }
      }
    } catch (err) {
      console.warn('Serial read loop interrupted:', err);
    } finally {
      reader.releaseLock();
      await readableStreamClosed.catch(() => {});
    }
  }

  public async sendCommand(cmd: 'BUZZER_ON' | 'BUZZER_OFF' | 'PING'): Promise<void> {
    if (!this.port || !this.port.writable) return;
    try {
      const writer = this.port.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(`${cmd}\n`));
      writer.releaseLock();
    } catch (err) {
      console.warn('Failed to send serial command:', err);
    }
  }

  public async disconnect() {
    this.isReading = false;
    try {
      if (this.reader) {
        await this.reader.cancel();
      }
      if (this.port) {
        await this.port.close();
      }
    } catch (_) {}
    this.port = null;
    this.onStatusChangeCallback?.({
      isSupported: this.isSupported(),
      isConnected: false,
    });
  }
}

export const esp32Serial = new ESP32SerialDriver();
