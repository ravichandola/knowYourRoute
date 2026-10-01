import type { VehicleProfile } from '@know-your-route/contracts';

/** Used when the caller does not (or cannot) identify a vehicle, so a plan can still be produced. */
export const DEFAULT_PLANNING_VEHICLE: Partial<VehicleProfile> = {
  make: 'Hyundai',
  model: 'Creta',
  fuelType: 'PETROL',
  tankCapacity: 50,
  currentState: { fuelLevel: 70, rangeKm: 480 },
};
