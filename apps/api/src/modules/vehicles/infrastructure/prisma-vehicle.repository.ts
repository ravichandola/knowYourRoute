import { Injectable } from '@nestjs/common';
import type { VehicleProfile } from '@know-your-route/contracts';
import { PrismaService } from '../../../platform/database/prisma.service';
import type { VehicleRepository } from '../domain/vehicle.repository';

interface VehicleRow {
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
}

const toVehicle = (row: VehicleRow): VehicleProfile => ({
  id: row.id,
  userId: row.userId,
  make: row.make,
  model: row.model,
  variant: row.variant ?? undefined,
  year: row.year ?? undefined,
  registrationNumber: row.registrationNumber,
  fuelType: row.fuelType,
  tankCapacity: row.tankCapacity ?? undefined,
  currentState: {
    odometer: row.odometer ?? undefined,
    fuelLevel: row.fuelLevel ?? undefined,
    batteryLevel: row.batteryLevel ?? undefined,
    rangeKm: row.rangeKm ?? undefined,
  },
  efficiency: {
    estimated: row.estimatedEfficiency ?? undefined,
    learned: row.learnedEfficiency ?? undefined,
    unit: row.fuelType === 'EV' ? 'km/kWh' : 'km/l',
  },
  dataSource: row.dataSource,
  isPrimary: row.isPrimary,
  lastUpdatedAt: row.updatedAt.toISOString(),
});

const toColumns = (vehicle: VehicleProfile) => ({
  make: vehicle.make,
  model: vehicle.model,
  variant: vehicle.variant,
  year: vehicle.year,
  registrationNumber: vehicle.registrationNumber || 'NA',
  fuelType: vehicle.fuelType,
  tankCapacity: vehicle.tankCapacity,
  odometer: vehicle.currentState?.odometer,
  fuelLevel: vehicle.currentState?.fuelLevel,
  batteryLevel: vehicle.currentState?.batteryLevel,
  rangeKm: vehicle.currentState?.rangeKm,
  estimatedEfficiency: vehicle.efficiency?.estimated,
  learnedEfficiency: vehicle.efficiency?.learned,
  dataSource: vehicle.dataSource,
  isPrimary: vehicle.isPrimary ?? false,
});

@Injectable()
export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByUser(userId: string): Promise<VehicleProfile[]> {
    const rows = await this.prisma.vehicle.findMany({ where: { userId } });
    return rows.map(toVehicle);
  }

  async findById(id: string): Promise<VehicleProfile | null> {
    const row = await this.prisma.vehicle.findUnique({ where: { id } });
    return row ? toVehicle(row) : null;
  }

  async save(vehicle: VehicleProfile): Promise<VehicleProfile> {
    const columns = toColumns(vehicle);
    const row = await this.prisma.vehicle.upsert({
      where: { id: vehicle.id },
      create: { id: vehicle.id, userId: vehicle.userId, ...columns },
      update: columns,
    });
    return toVehicle(row);
  }
}
