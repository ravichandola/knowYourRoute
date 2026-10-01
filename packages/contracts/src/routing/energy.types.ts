import type { FuelType } from '../vehicles/types';

export interface EnergyContext {
  fuelType: FuelType;
  estimatedConsumption: number; // Litres or kWh
  consumptionUnit: 'LITRES' | 'KWH';
  estimatedCost: number;
  currency: string;
  sufficientInitialLevel: boolean;
  requiredRefuelCount: number;
  recommendedRefuelDistanceKm?: number;
}
