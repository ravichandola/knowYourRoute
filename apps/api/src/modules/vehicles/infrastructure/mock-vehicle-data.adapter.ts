import { Injectable } from '@nestjs/common';
import type { VehicleProfile, VehicleSnapshot } from '@know-your-route/contracts';
import type { VehicleDataProvider } from '../domain/vehicle-data.port';

@Injectable()
export class MockVehicleDataAdapter implements VehicleDataProvider {
  async fetchConnectedVehicleTelemetry(vinOrId: string): Promise<Partial<VehicleProfile>> {
    return {
      make: 'Hyundai',
      model: 'Creta',
      variant: 'SX (O) 1.5 Turbo DCT',
      fuelType: 'PETROL',
      tankCapacity: 50,
      currentState: {
        odometer: 18450,
        fuelLevel: 72,
        rangeKm: 510,
      },
      efficiency: {
        estimated: 14.5,
        learned: 14.2,
        unit: 'km/l',
      },
      dataSource: 'OEM',
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  async processDashboardImage(imageBuffer: Uint8Array | ArrayBuffer): Promise<Partial<VehicleSnapshot>> {
    // Simulates AI Vision / OCR processing on instrument cluster snapshot
    return {
      detectedOdometer: 24150,
      detectedFuelLevel: 68,
      confidenceScore: 0.94,
      processedAt: new Date().toISOString(),
    };
  }
}
