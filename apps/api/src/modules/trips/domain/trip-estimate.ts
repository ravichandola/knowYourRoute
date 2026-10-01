import type { TripCostBreakdown } from '@know-your-route/contracts';

/** Placeholder estimate until the chosen route's costs are persisted with the trip. */
export const DEFAULT_TRIP_ESTIMATE = {
  totalDistanceKm: 148,
  totalDurationMinutes: 175,
  cost: {
    fuelCost: 1150,
    tollCost: 320,
    otherCharges: 0,
    totalCost: 1470,
    currency: 'INR',
  } satisfies TripCostBreakdown,
} as const;
