import type {
  RouteProfile,
  Trip,
  TripPreference,
  VehicleProfile,
} from '@know-your-route/contracts';

/** Everything the explainer (AI) is given to reason about one trip. */
export interface TripContext {
  tripId?: string;
  vehicle: VehicleProfile;
  route: RouteProfile;
  preferences?: TripPreference;
  userContext?: {
    drivingExperienceYears?: number;
  };
}

/**
 * Builds the context for a trip from what the trip stores today.
 * Detailed route intelligence is not persisted with a trip yet, so a corridor summary is derived.
 */
export function buildTripContext(trip: Trip, vehicle: VehicleProfile): TripContext {
  return {
    tripId: trip.id,
    vehicle,
    route: {
      id: trip.selectedRouteId,
      name: 'National Corridor NH-48',
      summary: 'Recommended fastest express corridor',
      distanceKm: trip.totalDistanceKm,
      durationMinutes: trip.totalDurationMinutes,
      geometry: { type: 'LineString', coordinates: [] },
      traffic: {
        overallSeverity: 'LIGHT',
        delayMinutes: 5,
        bottlenecksCount: 1,
        summary: 'Smooth highway progression',
      },
      toll: {
        totalCost: trip.estimatedCost.tollCost,
        currency: 'INR',
        tollPlazasCount: 2,
        electronicTollCovered: true,
        plazas: [],
      },
      energy: {
        fuelType: vehicle.fuelType,
        estimatedConsumption: 10.2,
        consumptionUnit: vehicle.fuelType === 'EV' ? 'KWH' : 'LITRES',
        estimatedCost: trip.estimatedCost.fuelCost,
        currency: 'INR',
        sufficientInitialLevel: true,
        requiredRefuelCount: 0,
      },
      road: { highwayPercentage: 85, surfaceCondition: 'EXCELLENT', terrain: 'PLAIN' },
      safety: {
        overallScore: 92,
        rating: 'HIGH',
        nightDrivingRisk: 'LOW',
        knownIncidents: [],
        emergencyServicesNearbyCount: 4,
        summary: 'High safety rating',
      },
      weather: {
        dominantCondition: 'CLEAR',
        temperatureCelsius: 28,
        visibilityKm: 10,
        precipitationProbability: 5,
        windSpeedKmh: 12,
        warnings: [],
        summary: 'Clear skies',
      },
      usefulStops: [],
      segments: [],
    },
  };
}
