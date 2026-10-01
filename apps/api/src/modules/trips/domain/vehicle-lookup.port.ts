import type { VehicleProfile } from '@know-your-route/contracts';

export const TRIP_VEHICLE_LOOKUP = 'TRIP_VEHICLE_LOOKUP';

export interface TripVehicleLookup {
  /** Throws NotFound/Forbidden when the vehicle is missing or not owned by the user. */
  getVehicle(vehicleId: string, userId?: string): Promise<VehicleProfile>;
}
