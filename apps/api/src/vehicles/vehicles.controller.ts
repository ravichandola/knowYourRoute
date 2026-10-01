import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehicleProfileInput, VehicleSnapshotInput } from '@know-your-route/validation';
import { User, VehicleProfile } from '@know-your-route/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  async listVehicles(@CurrentUser() user: User): Promise<VehicleProfile[]> {
    return this.vehiclesService.listVehicles(user.id);
  }

  @Get(':id')
  async getVehicle(@CurrentUser() user: User, @Param('id') id: string): Promise<VehicleProfile> {
    return this.vehiclesService.getVehicle(id, user.id);
  }

  @Post()
  async registerVehicle(
    @CurrentUser() user: User,
    @Body() body: VehicleProfileInput
  ): Promise<VehicleProfile> {
    return this.vehiclesService.registerVehicle(user.id, body);
  }

  @Post(':id/snapshot')
  async uploadSnapshot(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: VehicleSnapshotInput
  ): Promise<VehicleProfile> {
    return this.vehiclesService.processSnapshot(id, body, user.id);
  }

  @Post(':id/sync-telemetry')
  async syncTelemetry(@CurrentUser() user: User, @Param('id') id: string): Promise<VehicleProfile> {
    return this.vehiclesService.syncTelemetry(id, user.id);
  }
}
