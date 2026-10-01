import { Injectable } from '@nestjs/common';
import type { VehicleProfile } from '@know-your-route/contracts';
import { VehiclesService } from './vehicles.service';

/**
 * The only way other modules read vehicles. Keeps the internals (repositories, providers,
 * write operations) private to this module.
 */
@Injectable()
export class VehiclesFacade {
  constructor(private readonly vehiclesService: VehiclesService) {}

  /** Throws NotFound/Forbidden exactly like the HTTP endpoint would. */
  getVehicle(id: string, userId?: string): Promise<VehicleProfile> {
    return this.vehiclesService.getVehicle(id, userId);
  }
}
