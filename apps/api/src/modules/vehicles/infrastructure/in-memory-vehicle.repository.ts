import { Injectable } from '@nestjs/common';
import type { VehicleProfile } from '@know-your-route/contracts';
import { DEMO_USER_ID, DEMO_VEHICLE_ID } from '../../../platform/demo/demo-data';
import type { VehicleRepository } from '../domain/vehicle.repository';

@Injectable()
export class InMemoryVehicleRepository implements VehicleRepository {
  private readonly vehicles = new Map<string, VehicleProfile>([
    [
      DEMO_VEHICLE_ID,
      {
        id: DEMO_VEHICLE_ID,
        userId: DEMO_USER_ID,
        make: 'Hyundai',
        model: 'Creta',
        variant: 'SX (O) 1.5 Turbo DCT',
        year: 2024,
        registrationNumber: 'MH 02 FZ 4821',
        fuelType: 'PETROL',
        tankCapacity: 50,
        currentState: { odometer: 18450, fuelLevel: 72, rangeKm: 518 },
        efficiency: { estimated: 14.8, learned: 14.4, unit: 'km/l' },
        dataSource: 'USER_CONFIRMED',
        lastUpdatedAt: new Date().toISOString(),
        isPrimary: true,
      },
    ],
  ]);

  async listByUser(userId: string): Promise<VehicleProfile[]> {
    return [...this.vehicles.values()].filter((vehicle) => vehicle.userId === userId);
  }

  async findById(id: string): Promise<VehicleProfile | null> {
    return this.vehicles.get(id) ?? null;
  }

  async save(vehicle: VehicleProfile): Promise<VehicleProfile> {
    this.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }
}
