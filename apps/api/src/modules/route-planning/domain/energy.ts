import type { EnergyContext, VehicleProfile } from '@know-your-route/contracts';

const DEFAULT_EFFICIENCY = { ev: 7.2, combustion: 14.5 } as const;
const PRICE_PER_UNIT_INR = { EV: 18, DIESEL: 92, OTHER: 105 } as const;

/** Pure energy/cost estimation for a route; no framework or I/O dependencies. */
export function calculateEnergy(
  distanceKm: number,
  vehicle: Partial<VehicleProfile>
): EnergyContext {
  const fuelType = vehicle.fuelType || 'PETROL';
  const isEv = fuelType === 'EV';

  const efficiency =
    vehicle.efficiency?.learned ??
    vehicle.efficiency?.estimated ??
    (isEv ? DEFAULT_EFFICIENCY.ev : DEFAULT_EFFICIENCY.combustion);

  const consumption = Number((distanceKm / efficiency).toFixed(1));
  const pricePerUnit = isEv
    ? PRICE_PER_UNIT_INR.EV
    : fuelType === 'DIESEL'
      ? PRICE_PER_UNIT_INR.DIESEL
      : PRICE_PER_UNIT_INR.OTHER;

  const currentLevel = isEv
    ? (vehicle.currentState?.batteryLevel ?? 70)
    : (vehicle.currentState?.fuelLevel ?? 60);
  const tankCapacity = vehicle.tankCapacity ?? (isEv ? 50 : 45);
  const availableEnergy = (currentLevel / 100) * tankCapacity;

  const remainingRange =
    vehicle.currentState?.rangeKm ?? Math.round(availableEnergy * efficiency);
  const requiredRefuelCount =
    remainingRange < distanceKm
      ? Math.ceil((distanceKm - remainingRange) / (tankCapacity * efficiency * 0.8))
      : 0;

  return {
    fuelType,
    estimatedConsumption: consumption,
    consumptionUnit: isEv ? 'KWH' : 'LITRES',
    estimatedCost: Math.round(consumption * pricePerUnit),
    currency: 'INR',
    sufficientInitialLevel: availableEnergy >= consumption,
    requiredRefuelCount,
    recommendedRefuelDistanceKm:
      requiredRefuelCount > 0 ? Math.round(remainingRange * 0.85) : undefined,
  };
}
