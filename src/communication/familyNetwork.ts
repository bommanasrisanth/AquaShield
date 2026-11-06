/**
 * Family Safety Network & Offline SOS Generator
 * Manages up to 3 emergency contacts, common meeting points, check-ins,
 * and offline SMS dispatch generation.
 */

import { EmergencyContact, FamilyCheckIn } from '../types';
import { dbGetAll, dbPut, dbDelete } from '../offline/db';

export async function getSavedEmergencyContacts(): Promise<EmergencyContact[]> {
  const contacts = await dbGetAll<EmergencyContact>('emergencyContacts');
  if (contacts.length === 0) {
    // Default seed contact for instant preparedness
    const defaultContact: EmergencyContact = {
      id: 'contact-primary-default',
      name: 'Primary Family Contact',
      relation: 'Family',
      phone: '',
      isPrimary: true,
    };
    return [defaultContact];
  }
  return contacts;
}

export async function saveEmergencyContact(contact: EmergencyContact): Promise<void> {
  await dbPut('emergencyContacts', contact);
}

export async function deleteEmergencyContact(id: string): Promise<void> {
  await dbDelete('emergencyContacts', id);
}

export async function recordFamilyCheckIn(
  status: 'SAFE' | 'NEED_HELP' | 'EVACUATING',
  lat: number,
  lon: number,
  locationName: string,
  note?: string,
  isOnline = true
): Promise<FamilyCheckIn> {
  const checkIn: FamilyCheckIn = {
    id: `checkin-${Date.now()}`,
    timestamp: Date.now(),
    status,
    latitude: lat,
    longitude: lon,
    locationName,
    note,
    synced: isOnline,
  };
  await dbPut('familyCheckIns', checkIn);
  return checkIn;
}

export async function getFamilyCheckIns(): Promise<FamilyCheckIn[]> {
  const list = await dbGetAll<FamilyCheckIn>('familyCheckIns');
  return list.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Builds an offline cellular SMS link with coordinates and status.
 * Opens default mobile SMS app without requiring mobile data/internet.
 */
export function buildOfflineSMSUrl(
  phone: string,
  status: 'SAFE' | 'NEED_HELP' | 'EVACUATING',
  lat: number,
  lon: number,
  locationName: string,
  customNote?: string
): string {
  const mapUrl = `https://maps.google.com/?q=${lat.toFixed(5)},${lon.toFixed(5)}`;
  const statusText =
    status === 'SAFE'
      ? 'I AM SAFE'
      : status === 'NEED_HELP'
        ? 'EMERGENCY: I NEED IMMEDIATE ASSISTANCE / FLOOD RESCUE'
        : 'EVACUATING TO HIGH GROUND';

  const body = `[AquaShield Alert] ${statusText}.\nLocation: ${locationName} (${lat.toFixed(4)}, ${lon.toFixed(4)}).\nMap: ${mapUrl}${customNote ? `\nNote: ${customNote}` : ''}`;
  const encodedBody = encodeURIComponent(body);

  // Modern cross-platform SMS URI syntax
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const delimiter = isIOS ? '&' : '?';

  return `sms:${phone || ''}${delimiter}body=${encodedBody}`;
}
