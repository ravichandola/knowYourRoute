import { Injectable } from '@nestjs/common';
import { EnergyContext, VehicleProfile } from '@know-your-route/types';

@Injectable()
export class EnergyService {
  calculateEnergy(
    distanceKm: number,
    vehicle: Partial<VehicleProfile>,
    highwayPercentage = 80
  ): EnergyContext {
    const fuelType = vehicle.fuelType || 'PETROL';
    const isEv = fuelType === 'EV';

    // Base efficiency adjustment for highway vs city
    const baseEfficiency =
      vehicle.efficiency?.learned ??
      vehicle.efficiency?.estimated ??
      (isEv ? 7.2 : 14.5);

    const consumption = Number((distanceKm / baseEfficiency).toFixed(1));
    const pricePerUnit = isEv ? 18 : fuelType === 'DIESEL' ? 92 : 105;
    const estimatedCost = Math.round(consumption * pricePerUnit);

    const currentLevel = isEv
      ? vehicle.currentState?.batteryLevel ?? 70
      : vehicle.currentState?.fuelLevel ?? 60;

    const tankCapacity = vehicle.tankCapacity ?? (isEv ? 50 : 45);
    const availableEnergy = (currentLevel / 100) * tankCapacity;
    const sufficientInitialLevel = availableEnergy >= consumption;

    const remainingRange = vehicle.currentState?.rangeKm ?? Math.round(availableEnergy * baseEfficiency);
    const requiredRefuelCount = remainingRange < distanceKm ? Math.ceil((distanceKm - remainingRange) / (tankCapacity * baseEfficiency * 0.8)) : 0;

    return {
      fuelType,
      estimatedConsumption: consumption,
      consumptionUnit: isEv ? 'KWH' : 'LITRES',
      estimatedCost,
      currency: 'INR',
      sufficientInitialLevel,
      requiredRefuelCount,
      recommendedRefuelDistanceKm: requiredRefuelCount > 0 ? Math.round(remainingRange * 0.85) : undefined,
    };
  }
}
