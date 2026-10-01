import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  VehicleProfile,
  VehicleProfileInput,
  VehicleSnapshotInput,
} from '@know-your-route/contracts';
import { VEHICLE_DATA_PROVIDER, VehicleDataProvider } from '../domain/vehicle-data.port';
import { createVehicleProfile } from '../domain/vehicle-factory';
import { VEHICLE_REPOSITORY, VehicleRepository } from '../domain/vehicle.repository';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: VehicleRepository,
    @Inject(VEHICLE_DATA_PROVIDER) private readonly vehicleData: VehicleDataProvider
  ) {}

  listVehicles(userId: string): Promise<VehicleProfile[]> {
    return this.vehicles.listByUser(userId);
  }

  async getVehicle(id: string, userId?: string): Promise<VehicleProfile> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    if (userId && vehicle.userId !== userId) {
      throw new ForbiddenException('You do not have access to this vehicle');
    }
    return vehicle;
  }

  registerVehicle(userId: string, input: VehicleProfileInput): Promise<VehicleProfile> {
    return this.vehicles.save(createVehicleProfile(`veh_${Date.now()}`, userId, input));
  }

  async processSnapshot(
    vehicleId: string,
    input: VehicleSnapshotInput,
    userId?: string
  ): Promise<VehicleProfile> {
    const vehicle = await this.getVehicle(vehicleId, userId);
    const detected = await this.vehicleData.processDashboardImage(
      Buffer.from(input.photoBase64, 'base64')
    );

    return this.vehicles.save({
      ...vehicle,
      currentState: {
        ...vehicle.currentState,
        odometer: input.detectedOdometer ?? detected.detectedOdometer ?? vehicle.currentState?.odometer,
        fuelLevel:
          input.detectedFuelLevel ?? detected.detectedFuelLevel ?? vehicle.currentState?.fuelLevel,
        batteryLevel:
          input.detectedBatteryLevel ??
          detected.detectedBatteryLevel ??
          vehicle.currentState?.batteryLevel,
      },
      dataSource: 'PHOTO',
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  async syncTelemetry(vehicleId: string, userId?: string): Promise<VehicleProfile> {
    const vehicle = await this.getVehicle(vehicleId, userId);
    const telemetry = await this.vehicleData.fetchConnectedVehicleTelemetry(vehicleId);

    return this.vehicles.save({
      ...vehicle,
      currentState: { ...vehicle.currentState, ...telemetry.currentState },
      efficiency: { ...vehicle.efficiency, ...telemetry.efficiency },
      dataSource: 'OEM',
      lastUpdatedAt: new Date().toISOString(),
    });
  }
}
