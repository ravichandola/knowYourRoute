export interface SafetyIncident {
  id: string;
  type: 'BLACKSPOT' | 'ACCIDENT_PRONE' | 'POOR_LIGHTING' | 'LANDSLIDE_ZONE' | 'ROAD_WORK';
  severity: 'CAUTION' | 'WARNING' | 'CRITICAL';
  locationKm: number;
  description: string;
}

export interface SafetyContext {
  overallScore: number; // 0-100
  rating: 'HIGH' | 'MODERATE' | 'NEEDS_CAUTION';
  nightDrivingRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  knownIncidents: SafetyIncident[];
  emergencyServicesNearbyCount: number;
  summary: string;
}
