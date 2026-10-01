export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'EV';

export type VehicleDataSource = 'OEM' | 'PHOTO' | 'USER_CONFIRMED';

export interface VehicleState {
  odometer?: number;
  fuelLevel?: number;
  batteryLevel?: number;
  rangeKm?: number;
}

export interface VehicleEfficiency {
  estimated?: number;
  learned?: number;
  unit?: string;
}

export interface VehicleProfile {
  id: string;
  userId: string;
  make: string;
  model: string;
  variant?: string;
  year?: number;
  registrationNumber?: string;
  fuelType: FuelType;
  tankCapacity?: number;
  currentState?: VehicleState;
  efficiency?: VehicleEfficiency;
  dataSource: VehicleDataSource;
  lastUpdatedAt?: string;
  isPrimary?: boolean;
}

export interface VehicleSnapshot {
  id: string;
  vehicleId: string;
  photoUrl: string;
  detectedOdometer?: number;
  detectedFuelLevel?: number;
  detectedBatteryLevel?: number;
  confidenceScore: number;
  processedAt: string;
}
