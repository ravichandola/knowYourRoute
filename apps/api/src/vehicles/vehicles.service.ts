import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { VehicleProfile, VehicleSnapshot } from '@know-your-route/types';
import { VehicleProfileInput, VehicleSnapshotInput } from '@know-your-route/validation';
import { VEHICLE_PROVIDER, IVehicleProvider } from '../providers/vehicle/vehicle.interface';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class VehiclesService {
  private fallbackVehicles: Map<string, VehicleProfile> = new Map([
    [
      'veh_demo_creta',
      {
        id: 'veh_demo_creta',
        userId: 'usr_demo_101',
        make: 'Hyundai',
        model: 'Creta',
        variant: 'SX (O) 1.5 Turbo DCT',
        year: 2024,
        registrationNumber: 'MH 02 FZ 4821',
        fuelType: 'PETROL',
        tankCapacity: 50,
        currentState: {
          odometer: 18450,
          fuelLevel: 72,
          rangeKm: 518,
        },
        efficiency: {
          estimated: 14.8,
          learned: 14.4,
          unit: 'km/l',
        },
        dataSource: 'USER_CONFIRMED',
        lastUpdatedAt: new Date().toISOString(),
        isPrimary: true,
      },
    ],
  ]);

  constructor(
    @Inject(VEHICLE_PROVIDER) private vehicleProvider: IVehicleProvider,
    private prisma: PrismaService
  ) {}

  async listVehicles(userId: string): Promise<VehicleProfile[]> {
    try {
      const dbVehicles = await this.prisma.vehicle.findMany({
        where: { userId },
      });
      if (dbVehicles && dbVehicles.length > 0) {
        return dbVehicles.map((v) => this.mapDbVehicle(v));
      }
    } catch {
      // Fallback
    }

    return Array.from(this.fallbackVehicles.values()).filter((v) => v.userId === userId);
  }

  async getVehicle(id: string, userId?: string): Promise<VehicleProfile> {
    try {
      const dbVehicle = await this.prisma.vehicle.findUnique({ where: { id } });
      if (dbVehicle) {
        if (userId && dbVehicle.userId !== userId) {
          throw new ForbiddenException('You do not have access to this vehicle');
        }
        return this.mapDbVehicle(dbVehicle);
      }
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
    }

    const vehicle = this.fallbackVehicles.get(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    if (userId && vehicle.userId !== userId) {
      throw new ForbiddenException('You do not have access to this vehicle');
    }
    return vehicle;
  }

  async registerVehicle(userId: string, input: VehicleProfileInput): Promise<VehicleProfile> {
    const id = `veh_${Date.now()}`;
    const newVehicle: VehicleProfile = {
      id,
      userId,
      make: input.make,
      model: input.model,
      variant: input.variant,
      year: input.year,
      registrationNumber: input.registrationNumber,
      fuelType: input.fuelType,
      tankCapacity: input.tankCapacity || (input.fuelType === 'EV' ? 60 : 45),
      currentState: input.currentState || {
        odometer: 10000,
        fuelLevel: 65,
        rangeKm: 420,
      },
      efficiency: {
        estimated: input.fuelType === 'EV' ? 7.2 : 14.5,
        learned: input.fuelType === 'EV' ? 7.0 : 14.2,
        unit: input.fuelType === 'EV' ? 'km/kWh' : 'km/l',
      },
      dataSource: input.dataSource || 'USER_CONFIRMED',
      isPrimary: true,
      lastUpdatedAt: new Date().toISOString(),
    };

    this.fallbackVehicles.set(id, newVehicle);

    try {
      await this.prisma.vehicle.create({
        data: {
          id: newVehicle.id,
          userId,
          make: newVehicle.make,
          model: newVehicle.model,
          variant: newVehicle.variant,
          year: newVehicle.year,
          registrationNumber: newVehicle.registrationNumber || 'NA',
          fuelType: newVehicle.fuelType,
          tankCapacity: newVehicle.tankCapacity,
          odometer: newVehicle.currentState?.odometer,
          fuelLevel: newVehicle.currentState?.fuelLevel,
          batteryLevel: newVehicle.currentState?.batteryLevel,
          rangeKm: newVehicle.currentState?.rangeKm,
          estimatedEfficiency: newVehicle.efficiency?.estimated,
          dataSource: newVehicle.dataSource,
          isPrimary: true,
        },
      });
    } catch {
      // Memory fallback succeeded
    }

    return newVehicle;
  }

  async processSnapshot(
    vehicleId: string,
    input: VehicleSnapshotInput,
    userId?: string
  ): Promise<VehicleProfile> {
    const vehicle = await this.getVehicle(vehicleId, userId);

    // Call OCR / Vision provider adapter
    const detected = await this.vehicleProvider.processDashboardImage(
      Buffer.from(input.photoBase64, 'base64')
    );

    const updatedState = {
      ...vehicle.currentState,
      odometer: input.detectedOdometer ?? detected.detectedOdometer ?? vehicle.currentState?.odometer,
      fuelLevel: input.detectedFuelLevel ?? detected.detectedFuelLevel ?? vehicle.currentState?.fuelLevel,
      batteryLevel: input.detectedBatteryLevel ?? detected.detectedBatteryLevel ?? vehicle.currentState?.batteryLevel,
    };

    const updatedVehicle: VehicleProfile = {
      ...vehicle,
      currentState: updatedState,
      dataSource: 'PHOTO',
      lastUpdatedAt: new Date().toISOString(),
    };

    this.fallbackVehicles.set(vehicleId, updatedVehicle);
    return updatedVehicle;
  }

  async syncTelemetry(vehicleId: string, userId?: string): Promise<VehicleProfile> {
    const vehicle = await this.getVehicle(vehicleId, userId);
    const telemetry = await this.vehicleProvider.fetchConnectedVehicleTelemetry(vehicleId);

    const updated: VehicleProfile = {
      ...vehicle,
      currentState: {
        ...vehicle.currentState,
        ...telemetry.currentState,
      },
      efficiency: {
        ...vehicle.efficiency,
        ...telemetry.efficiency,
      },
      dataSource: 'OEM',
      lastUpdatedAt: new Date().toISOString(),
    };

    this.fallbackVehicles.set(vehicleId, updated);
    return updated;
  }

  private mapDbVehicle(v: {
    id: string;
    userId: string;
    make: string;
    model: string;
    variant: string | null;
    year: number | null;
    registrationNumber: string;
    fuelType: VehicleProfile['fuelType'];
    tankCapacity: number | null;
    odometer: number | null;
    fuelLevel: number | null;
    batteryLevel: number | null;
    rangeKm: number | null;
    estimatedEfficiency: number | null;
    learnedEfficiency: number | null;
    dataSource: VehicleProfile['dataSource'];
    isPrimary: boolean;
    updatedAt: Date;
  }): VehicleProfile {
    return {
      id: v.id,
      userId: v.userId,
      make: v.make,
      model: v.model,
      variant: v.variant || undefined,
      year: v.year || undefined,
      registrationNumber: v.registrationNumber,
      fuelType: v.fuelType,
      tankCapacity: v.tankCapacity || undefined,
      currentState: {
        odometer: v.odometer || undefined,
        fuelLevel: v.fuelLevel || undefined,
        batteryLevel: v.batteryLevel || undefined,
        rangeKm: v.rangeKm || undefined,
      },
      efficiency: {
        estimated: v.estimatedEfficiency || undefined,
        learned: v.learnedEfficiency || undefined,
        unit: v.fuelType === 'EV' ? 'km/kWh' : 'km/l',
      },
      dataSource: v.dataSource,
      isPrimary: v.isPrimary,
      lastUpdatedAt: v.updatedAt.toISOString(),
    };
  }
}
