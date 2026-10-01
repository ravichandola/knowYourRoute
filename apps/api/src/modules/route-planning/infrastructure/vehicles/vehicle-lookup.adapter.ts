import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { VehicleProfile } from '@know-your-route/contracts';
import { VehiclesFacade } from '../../../vehicles';
import type { VehicleLookupPort } from '../../domain/ports';

/** Route planning -> vehicles. The only place this module depends on the vehicles module. */
@Injectable()
export class VehicleLookupAdapter implements VehicleLookupPort {
  constructor(private readonly vehicles: VehiclesFacade) {}

  async findForPlanning(vehicleId: string, userId?: string): Promise<VehicleProfile | undefined> {
    try {
      return await this.vehicles.getVehicle(vehicleId, userId);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        return undefined;
      }
      throw error;
    }
  }
}
