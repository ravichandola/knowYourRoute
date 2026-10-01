import type { VehicleProfile, VehicleProfileInput } from '@know-your-route/contracts';

/** Builds a new profile from user input, applying sensible defaults for missing data. */
export function createVehicleProfile(
  id: string,
  userId: string,
  input: VehicleProfileInput,
  now: Date = new Date()
): VehicleProfile {
  const isEv = input.fuelType === 'EV';
  return {
    id,
    userId,
    make: input.make,
    model: input.model,
    variant: input.variant,
    year: input.year,
    registrationNumber: input.registrationNumber,
    fuelType: input.fuelType,
    tankCapacity: input.tankCapacity || (isEv ? 60 : 45),
    currentState: input.currentState || { odometer: 10000, fuelLevel: 65, rangeKm: 420 },
    efficiency: {
      estimated: isEv ? 7.2 : 14.5,
      learned: isEv ? 7.0 : 14.2,
      unit: isEv ? 'km/kWh' : 'km/l',
    },
    dataSource: input.dataSource || 'USER_CONFIRMED',
    isPrimary: true,
    lastUpdatedAt: now.toISOString(),
  };
}
