import type { VehicleProfile } from '@know-your-route/contracts';

export const VEHICLE_LOOKUP_PORT = 'VEHICLE_LOOKUP_PORT';
export interface VehicleLookupPort {
  /** Returns `undefined` when the vehicle does not exist or is not accessible to the user. */
  findForPlanning(vehicleId: string, userId?: string): Promise<VehicleProfile | undefined>;
}
