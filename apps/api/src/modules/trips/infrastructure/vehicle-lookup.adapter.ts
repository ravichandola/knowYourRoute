import { Injectable } from '@nestjs/common';
import type { VehicleProfile } from '@know-your-route/contracts';
import { VehiclesFacade } from '../../vehicles';
import type { TripVehicleLookup } from '../domain/vehicle-lookup.port';

/** Trips -> vehicles. The only place this module depends on the vehicles module. */
@Injectable()
export class VehicleLookupAdapter implements TripVehicleLookup {
  constructor(private readonly vehicles: VehiclesFacade) {}

  getVehicle(vehicleId: string, userId?: string): Promise<VehicleProfile> {
    return this.vehicles.getVehicle(vehicleId, userId);
  }
}
