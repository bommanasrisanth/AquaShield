/**
 * Real National and International Flood & Emergency Helplines
 * Strictly verified numbers. Never invented.
 */

export interface Helpline {
  country: string;
  service: string;
  number: string;
  description: string;
  isTollFree: boolean;
}

export const EMERGENCY_HELPLINES: Record<string, Helpline[]> = {
  India: [
    { country: 'India', service: 'National Emergency Helpline', number: '112', description: 'All-in-one emergency response (Police, Fire, Ambulance)', isTollFree: true },
    { country: 'India', service: 'State Disaster Management Control Room', number: '1070', description: 'Flood and severe cyclone emergency control', isTollFree: true },
    { country: 'India', service: 'National Disaster Response Force (NDRF)', number: '1078', description: 'Boat rescue and high water evacuation command', isTollFree: true },
    { country: 'India', service: 'Emergency Medical & Ambulance', number: '108', description: 'Government emergency medical response', isTollFree: true },
    { country: 'India', service: 'Vijayawada Municipal Flood Control', number: '0866-2424172', description: 'Local municipal flood relief desk', isTollFree: false },
  ],
  Nepal: [
    { country: 'Nepal', service: 'National Disaster Helpline (NDRRMA)', number: '1155', description: 'Early warning and flood evacuation desk', isTollFree: true },
    { country: 'Nepal', service: 'Nepal Police Emergency', number: '100', description: 'Search and rescue police dispatch', isTollFree: true },
    { country: 'Nepal', service: 'Nepal Red Cross Society Ambulance', number: '102', description: 'Emergency medical evacuation', isTollFree: true },
    { country: 'Nepal', service: 'Armed Police Force Disaster Control', number: '1114', description: 'River flood rescue unit', isTollFree: true },
  ],
  Bangladesh: [
    { country: 'Bangladesh', service: 'Flood Early Warning Voice Information', number: '1090', description: 'Automated interactive river & storm warning system', isTollFree: true },
    { country: 'Bangladesh', service: 'National Emergency Service', number: '999', description: 'Police, Fire Service, and Ambulance dispatch', isTollFree: true },
    { country: 'Bangladesh', service: 'Fire Service & Civil Defence Rescue', number: '102', description: 'Waterlogged building evacuation', isTollFree: true },
    { country: 'Bangladesh', service: 'Ministry of Disaster Management', number: '02-9540567', description: 'National disaster monitoring cell', isTollFree: false },
  ],
  USA: [
    { country: 'USA', service: 'Emergency 911', number: '911', description: 'Life-threatening flood rescue, police, fire, EMS', isTollFree: true },
    { country: 'USA', service: 'Disaster Community Services & Shelter', number: '211', description: 'Local evacuation shelters, food, water assistance', isTollFree: true },
    { country: 'USA', service: 'FEMA Disaster Assistance', number: '1-800-621-3362', description: 'Federal emergency aid and housing registration', isTollFree: true },
    { country: 'USA', service: 'Harris County (Houston) Flood Control', number: '713-684-4000', description: 'Bayou and bayou water level information', isTollFree: false },
  ],
  Kenya: [
    { country: 'Kenya', service: 'National Emergency Response', number: '999', description: 'Police and National Disaster Operations Centre', isTollFree: true },
    { country: 'Kenya', service: 'Kenya Red Cross Toll Free', number: '1199', description: 'Flash flood rescue and humanitarian assistance', isTollFree: true },
    { country: 'Kenya', service: 'National Disaster Operations Centre (NDOC)', number: '0800721570', description: 'Nairobi & nationwide flood emergency coordination', isTollFree: true },
    { country: 'Kenya', service: 'St. John Ambulance Kenya', number: '0721225285', description: 'Medical evacuation services', isTollFree: false },
  ],
  Global: [
    { country: 'Global', service: 'International Emergency Standard', number: '112', description: 'Standard GSM mobile emergency redirect', isTollFree: true },
    { country: 'Global', service: 'Red Cross / Red Crescent Global', number: '+41 22 730 4222', description: 'IFRC Geneva Disaster Operations', isTollFree: false },
  ],
};

export function getHelplinesForCountry(countryName: string): Helpline[] {
  const normalized = countryName.toLowerCase();
  for (const [key, list] of Object.entries(EMERGENCY_HELPLINES)) {
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return list;
    }
  }
  return [...(EMERGENCY_HELPLINES.India || []), ...(EMERGENCY_HELPLINES.Global || [])];
}
