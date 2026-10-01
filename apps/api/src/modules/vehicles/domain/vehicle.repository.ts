import type { VehicleProfile } from '@know-your-route/contracts';

export const VEHICLE_REPOSITORY = 'VEHICLE_REPOSITORY';

/** Port: how the vehicles module stores vehicle profiles. */
export interface VehicleRepository {
  listByUser(userId: string): Promise<VehicleProfile[]>;
  findById(id: string): Promise<VehicleProfile | null>;
  save(vehicle: VehicleProfile): Promise<VehicleProfile>;
}
