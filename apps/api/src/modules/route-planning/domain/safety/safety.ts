import type { SafetyContext } from '@know-your-route/contracts';

const HIGHWAY_DOMINANT_THRESHOLD = 70;

/** Pure safety heuristic for a route; no framework or I/O dependencies. */
export function evaluateSafety(distanceKm: number, highwayPercentage: number): SafetyContext {
  const isHighwayDominant = highwayPercentage >= HIGHWAY_DOMINANT_THRESHOLD;

  return {
    overallScore: isHighwayDominant ? 91 : 78,
    rating: isHighwayDominant ? 'HIGH' : 'MODERATE',
    nightDrivingRisk: isHighwayDominant ? 'LOW' : 'MEDIUM',
    knownIncidents: isHighwayDominant
      ? []
      : [
          {
            id: 'inc_safe_1',
            type: 'POOR_LIGHTING',
            severity: 'CAUTION',
            locationKm: Math.round(distanceKm * 0.4),
            description: 'Two-lane section with limited street lighting.',
          },
        ],
    emergencyServicesNearbyCount: isHighwayDominant ? 5 : 2,
    summary: isHighwayDominant
      ? 'Well-engineered highway with median barriers and emergency call boxes.'
      : 'Mixed road surfaces; drive cautiously during evening hours.',
  };
}
