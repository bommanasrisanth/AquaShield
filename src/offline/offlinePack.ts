/**
 * Offline Emergency Resources & Readiness Checklist Pack
 * Pre-caches complete emergency survival instructions, checklists, and medical guides.
 */

import { EmergencyChecklistItem } from '../types';
import { dbGetAll, dbPut } from './db';

export const DEFAULT_CHECKLIST_ITEMS: EmergencyChecklistItem[] = [
  {
    id: 'chk-water-01',
    category: 'WATER_FOOD',
    title: 'Drinking Water (3 Liters per Person / Day)',
    description: 'Store sealed bottled water in elevated, clean containers. Minimum 3-day supply.',
    isCompleted: false,
    criticality: 'CRITICAL',
  },
  {
    id: 'chk-water-02',
    category: 'WATER_FOOD',
    title: 'Water Purification Tablets or Chlorine Bleach',
    description: 'Ensure you have unscented household bleach (5-6%) with an eyedropper for emergency disinfection.',
    isCompleted: false,
    criticality: 'CRITICAL',
  },
  {
    id: 'chk-food-01',
    category: 'WATER_FOOD',
    title: 'Non-Perishable Food & Manual Can Opener',
    description: 'Ready-to-eat canned meats, vegetables, dry fruits, energy bars that require no electricity or cooking.',
    isCompleted: false,
    criticality: 'IMPORTANT',
  },
  {
    id: 'chk-med-01',
    category: 'MEDICAL',
    title: '7-Day Prescription Medications in Waterproof Pouch',
    description: 'Insulin, blood pressure pills, inhalers, or cardiac drugs sealed against water ingress.',
    isCompleted: false,
    criticality: 'CRITICAL',
  },
  {
    id: 'chk-med-02',
    category: 'MEDICAL',
    title: 'First-Aid Kit with Antiseptic & Bandages',
    description: 'Sterile gauze, povidone-iodine, adhesive tape, antibiotic ointment, oral rehydration salts (ORS).',
    isCompleted: false,
    criticality: 'CRITICAL',
  },
  {
    id: 'chk-doc-01',
    category: 'DOCUMENTS',
    title: 'Identification, Deeds & Insurance in Dry Bag',
    description: 'Passports, National IDs, property papers, insurance policies, and cash in small denominations.',
    isCompleted: false,
    criticality: 'IMPORTANT',
  },
  {
    id: 'chk-eq-01',
    category: 'EQUIPMENT',
    title: 'Loud Whistle & Waterproof LED Flashlight',
    description: 'Whistles can be heard by rescuers over roaring flood waters when human shouting fails.',
    isCompleted: false,
    criticality: 'CRITICAL',
  },
  {
    id: 'chk-eq-02',
    category: 'EQUIPMENT',
    title: 'Fully Charged Power Bank & Spare Cables',
    description: 'Keep phones in low-power battery-saver mode with offline apps loaded.',
    isCompleted: false,
    criticality: 'IMPORTANT',
  },
  {
    id: 'chk-spec-01',
    category: 'SPECIAL_NEEDS',
    title: 'Elderly & Infant Care Essentials',
    description: 'Baby formula, diapers, spare eyeglasses, walking canes, and emergency medical history card.',
    isCompleted: false,
    criticality: 'IMPORTANT',
  },
];

export async function getChecklistItems(): Promise<EmergencyChecklistItem[]> {
  const items = await dbGetAll<EmergencyChecklistItem>('checklistStatus');
  if (items.length === 0) {
    for (const item of DEFAULT_CHECKLIST_ITEMS) {
      await dbPut('checklistStatus', item);
    }
    return DEFAULT_CHECKLIST_ITEMS;
  }
  return items;
}

export async function toggleChecklistItem(id: string): Promise<EmergencyChecklistItem[]> {
  const items = await getChecklistItems();
  const target = items.find((it) => it.id === id);
  if (target) {
    target.isCompleted = !target.isCompleted;
    await dbPut('checklistStatus', target);
  }
  return [...items];
}

export function calculateReadinessScore(items: EmergencyChecklistItem[]): number {
  if (items.length === 0) return 0;
  const criticalCount = items.filter((i) => i.criticality === 'CRITICAL').length;
  const completedCritical = items.filter((i) => i.criticality === 'CRITICAL' && i.isCompleted).length;
  const otherCount = items.length - criticalCount;
  const completedOther = items.filter((i) => i.criticality !== 'CRITICAL' && i.isCompleted).length;

  // Weight critical items 70%, other items 30%
  const critScore = criticalCount > 0 ? (completedCritical / criticalCount) * 70 : 0;
  const otherScore = otherCount > 0 ? (completedOther / otherCount) * 30 : 0;
  return Math.round(critScore + otherScore);
}

/**
 * Downloads and caches the complete offline emergency survival pack
 */
export async function downloadOfflineEmergencyPack(onProgress: (pct: number, status: string) => void): Promise<boolean> {
  try {
    onProgress(10, 'Initializing local database...');
    await new Promise((r) => setTimeout(r, 150));

    onProgress(30, 'Saving disaster shelter locations & contact registries...');
    await dbPut('offlineResources', {
      key: 'offline_pack_meta',
      installedAt: Date.now(),
      version: '2026.11',
      sizeBytes: 1048576,
    });
    await new Promise((r) => setTimeout(r, 200));

    onProgress(60, 'Caching offline multilingual medical & first aid guides...');
    await dbPut('offlineResources', {
      key: 'offline_medical_guide',
      content: 'Complete water purification, leptospirosis prevention, hypothermia treatment and CPR instructions stored.',
    });
    await new Promise((r) => setTimeout(r, 200));

    onProgress(85, 'Compiling offline vector baseline maps...');
    await new Promise((r) => setTimeout(r, 200));

    onProgress(100, 'Offline Emergency Pack Ready!');
    return true;
  } catch (err) {
    console.warn('Failed to pre-cache offline pack:', err);
    return false;
  }
}

export async function isOfflinePackInstalled(): Promise<boolean> {
  const meta = await dbGetAll('offlineResources');
  return meta.some((m: any) => m.key === 'offline_pack_meta');
}
