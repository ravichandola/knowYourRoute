import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  vehiclesContract,
  type User,
  type VehicleProfile,
  type VehicleProfileInput,
  type VehicleSnapshotInput,
} from '@know-your-route/contracts';
import { ContractBody } from '../../../platform/http';
import { CurrentUser } from '../../identity';
import { VehiclesService } from '../application/vehicles.service';

@Controller(vehiclesContract.basePath)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get(vehiclesContract.list.path)
  list(@CurrentUser() user: User): Promise<VehicleProfile[]> {
    return this.vehiclesService.listVehicles(user.id);
  }

  @Get(vehiclesContract.get.path)
  get(@CurrentUser() user: User, @Param('id') id: string): Promise<VehicleProfile> {
    return this.vehiclesService.getVehicle(id, user.id);
  }

  @Post(vehiclesContract.register.path)
  register(
    @CurrentUser() user: User,
    @ContractBody(vehiclesContract.register) body: VehicleProfileInput
  ): Promise<VehicleProfile> {
    return this.vehiclesService.registerVehicle(user.id, body);
  }

  @Post(vehiclesContract.uploadSnapshot.path)
  uploadSnapshot(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @ContractBody(vehiclesContract.uploadSnapshot) body: VehicleSnapshotInput
  ): Promise<VehicleProfile> {
    return this.vehiclesService.processSnapshot(id, body, user.id);
  }

  @Post(vehiclesContract.syncTelemetry.path)
  syncTelemetry(@CurrentUser() user: User, @Param('id') id: string): Promise<VehicleProfile> {
    return this.vehiclesService.syncTelemetry(id, user.id);
  }
}
