/**
 * Community Flood Radar & Incident Reporting Engine
 * Store-and-forward architecture with offline queue and verification lifecycle.
 */

import { CommunityReport, CommunityReportType } from '../types';
import { dbGetAll, dbPut } from '../offline/db';
import { calculateHaversineDistanceKm } from '../evacuation/shelters';

// Seed community reports for demonstration and realistic neighborhood awareness
export const DEFAULT_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'report-seed-01',
    timestamp: Date.now() - (45 * 60 * 1000), // 45 mins ago
    latitude: 16.5085,
    longitude: 80.642,
    locationName: 'Bandar Canal Underpass, Vijayawada',
    reportType: 'FLOODED_ROAD',
    description: 'Underpass submerged under ~40cm water. Cars turning back, two-wheelers stuck.',
    waterDepthCm: 42,
    isPassableForVehicles: false,
    verificationStatus: 'COMMUNITY_CONFIRMED',
    upvotes: 7,
    source: 'CITIZEN',
    synced: true,
  },
  {
    id: 'report-seed-02',
    timestamp: Date.now() - (120 * 60 * 1000), // 2 hrs ago
    latitude: 16.516,
    longitude: 80.618,
    locationName: 'Bhavanipuram Riverbank Ghat',
    reportType: 'RISING_WATER',
    description: 'Krishna river floodwater approaching retaining embankment staircase.',
    waterDepthCm: 65,
    isPassableForVehicles: false,
    verificationStatus: 'OFFICIALLY_VERIFIED',
    upvotes: 14,
    source: 'FIRST_RESPONDER',
    synced: true,
  },
];

export async function getCommunityReports(): Promise<CommunityReport[]> {
  const localReports = await dbGetAll<CommunityReport>('communityReports');
  if (localReports.length === 0) {
    // Seed default reports
    for (const r of DEFAULT_COMMUNITY_REPORTS) {
      await dbPut('communityReports', r);
    }
    return DEFAULT_COMMUNITY_REPORTS;
  }
  return localReports.sort((a, b) => b.timestamp - a.timestamp);
}

export async function submitCommunityReport(
  reportData: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes' | 'synced' | 'verificationStatus'>,
  isOnline = true
): Promise<CommunityReport> {
  const newReport: CommunityReport = {
    ...reportData,
    id: `report-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    verificationStatus: 'UNVERIFIED',
    upvotes: 1,
    synced: isOnline,
  };

  await dbPut('communityReports', newReport);
  return newReport;
}

export async function upvoteCommunityReport(id: string): Promise<void> {
  const reports = await getCommunityReports();
  const target = reports.find((r) => r.id === id);
  if (target) {
    target.upvotes += 1;
    if (target.upvotes >= 3 && target.verificationStatus === 'UNVERIFIED') {
      target.verificationStatus = 'COMMUNITY_CONFIRMED';
    }
    await dbPut('communityReports', target);
  }
}

/**
 * Clusters reports within 500 meters to prevent duplicate clutter
 */
export function clusterNearbyReports(reports: CommunityReport[], radiusKm = 0.5): CommunityReport[][] {
  const clusters: CommunityReport[][] = [];
  const visited = new Set<string>();

  for (let i = 0; i < reports.length; i++) {
    const current = reports[i];
    if (visited.has(current.id)) continue;

    const currentCluster: CommunityReport[] = [current];
    visited.add(current.id);

    for (let j = i + 1; j < reports.length; j++) {
      const other = reports[j];
      if (visited.has(other.id)) continue;

      const dist = calculateHaversineDistanceKm(
        current.latitude,
        current.longitude,
        other.latitude,
        other.longitude
      );

      if (dist <= radiusKm) {
        currentCluster.push(other);
        visited.add(other.id);
      }
    }
    clusters.push(currentCluster);
  }

  return clusters;
}
