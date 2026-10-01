import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehicleProfileInput, VehicleSnapshotInput } from '@know-your-route/validation';
import { VehicleProfile } from '@know-your-route/types';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  async listVehicles(@Query('userId') userId = 'usr_demo_101'): Promise<VehicleProfile[]> {
    return this.vehiclesService.listVehicles(userId);
  }

  @Get(':id')
  async getVehicle(@Param('id') id: string): Promise<VehicleProfile> {
    return this.vehiclesService.getVehicle(id);
  }

  @Post()
  async registerVehicle(
    @Query('userId') userId = 'usr_demo_101',
    @Body() body: VehicleProfileInput
  ): Promise<VehicleProfile> {
    return this.vehiclesService.registerVehicle(userId, body);
  }

  @Post(':id/snapshot')
  async uploadSnapshot(
    @Param('id') id: string,
    @Body() body: VehicleSnapshotInput
  ): Promise<VehicleProfile> {
    return this.vehiclesService.processSnapshot(id, body);
  }

  @Post(':id/sync-telemetry')
  async syncTelemetry(@Param('id') id: string): Promise<VehicleProfile> {
    return this.vehiclesService.syncTelemetry(id);
  }
}
