/**
 * Emergency Haptic Vibration Driver
 * Uses standard Navigator.vibrate with patterned alerts.
 */

let hasActiveVibration = false;

export function triggerEmergencyVibration(pattern: number[] = [500, 200, 500, 200, 1000]): boolean {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      const res = navigator.vibrate(pattern);
      if (res) hasActiveVibration = true;
      return res;
    } catch (_) {
      return false;
    }
  }
  return false;
}

export function stopEmergencyVibration() {
  if (hasActiveVibration && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(0);
      hasActiveVibration = false;
    } catch (_) {}
  }
}
