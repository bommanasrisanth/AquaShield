/**
 * FloodGuard Core Type Definitions
 * Global AI-Powered Flood Intelligence & Offline Emergency Response System
 */

export type FloodStatusLevel = 'SAFE' | 'WATCH' | 'PREPARE' | 'LEAVE NOW';

export type OperatingMode = 'MODE_A_ONLINE' | 'MODE_B_LIMITED' | 'MODE_C_OFFLINE';

export type LanguageCode =
  | 'en' // English
  | 'hi' // Hindi (हिन्दी)
  | 'te' // Telugu (తెలుగు)
  | 'ta' // Tamil (தமிழ்)
  | 'ne' // Nepali (नेपाली)
  | 'bn' // Bengali (বাংলা)
  | 'es' // Spanish (Español)
  | 'fr' // French (Français)
  | 'ar' // Arabic (العربية - RTL)
  | 'pt' // Portuguese (Português)
  | 'id' // Indonesian (Bahasa Indonesia)
  | 'sw'; // Swahili (Kiswahili)

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  riverBasin?: string;
  elevationMeters?: number;
}

export interface RiverDischargeData {
  currentDischargeM3s: number;
  historicalMeanM3s: number;
  historicalMaxM3s: number;
  rateOfRisePerHour: number; // m3/s per hour
  dischargeThresholdM3s: number;
  isSpike: boolean;
}

export interface RainfallData {
  rainLast1HourMm: number;
  rainLast24HoursMm: number;
  rainForecastNext24HoursMm: number;
  rainIntensity: 'none' | 'light' | 'moderate' | 'heavy' | 'torrential';
}

export interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: number;
  waterLevelCm: number;
  baselineCm: number;
  rateOfRiseCmPerHour: number;
  batteryPercentage: number;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL' | 'FAULT';
  faultReason?: string;
  rawDistanceCm: number;
  filteredDistanceCm: number;
}

export interface RiskAssessment {
  status: FloodStatusLevel;
  urgency: 'Low' | 'Moderate' | 'High' | 'Immediate Life Threat';
  confidencePercentage: number;
  lastUpdated: number;
  isStale: boolean;
  staleReason?: string;
  actionSummary: string;
  detailedGuidance: string[];
  factors: {
    riverDischargeRisk: number; // 0 - 100
    rainfallRisk: number; // 0 - 100
    elevationVulnerability: number; // 0 - 100
    sensorAlertLevel: number; // 0 - 100
    communityReportCount: number;
  };
}

export interface EvacuationShelter {
  id: string;
  name: string;
  type: 'OFFICIAL_SHELTER' | 'HOSPITAL' | 'COMMUNITY_CENTRE' | 'SCHOOL' | 'ELEVATED_GROUND';
  address: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  isVerified: boolean;
  verifiedBy?: string;
  capacity: number;
  currentOccupancy: number;
  distanceKm: number;
  estimatedWalkingMinutes: number;
  estimatedDrivingMinutes: number;
  floodRiskLevel: 'SAFE' | 'LOW' | 'ELEVATED';
  hasMedicalSupport: boolean;
  hasCleanWater: boolean;
  contactPhone?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
}

export interface FamilyCheckIn {
  id: string;
  timestamp: number;
  status: 'SAFE' | 'NEED_HELP' | 'EVACUATING';
  latitude: number;
  longitude: number;
  locationName: string;
  note?: string;
  synced: boolean;
}

export type CommunityReportType =
  | 'FLOODED_ROAD'
  | 'WATER_ENTERING_BUILDING'
  | 'RISING_WATER'
  | 'BLOCKED_BRIDGE'
  | 'DRAINAGE_OVERFLOW';

export interface CommunityReport {
  id: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  locationName: string;
  reportType: CommunityReportType;
  description: string;
  waterDepthCm?: number;
  isPassableForVehicles: boolean;
  verificationStatus: 'UNVERIFIED' | 'COMMUNITY_CONFIRMED' | 'OFFICIALLY_VERIFIED';
  upvotes: number;
  source: 'CITIZEN' | 'FIRST_RESPONDER' | 'IOT_SENSOR';
  synced: boolean;
  photoUrl?: string;
}

export interface EmergencyChecklistItem {
  id: string;
  category: 'WATER_FOOD' | 'MEDICAL' | 'DOCUMENTS' | 'EQUIPMENT' | 'SPECIAL_NEEDS';
  title: string;
  description: string;
  isCompleted: boolean;
  criticality: 'CRITICAL' | 'IMPORTANT' | 'RECOMMENDED';
}

export interface CAPAlert {
  identifier: string;
  sender: string;
  sent: string;
  status: 'Actual' | 'Exercise' | 'Draft';
  msgType: 'Alert' | 'Update' | 'Cancel';
  scope: 'Public' | 'Restricted';
  category: 'Met' | 'Safety' | 'Rescue';
  event: string;
  urgency: 'Immediate' | 'Expected' | 'Future';
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor';
  certainty: 'Observed' | 'Likely' | 'Possible';
  headline: string;
  description: string;
  instruction: string;
  areaDesc: string;
  circleCoordinates?: string; // lat,lon,radius
}
