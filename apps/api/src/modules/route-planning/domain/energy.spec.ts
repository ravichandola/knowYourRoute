import { calculateEnergy } from './energy';

describe('calculateEnergy', () => {
  it('estimates petrol consumption and cost from learned efficiency', () => {
    const result = calculateEnergy(145, {
      fuelType: 'PETROL',
      tankCapacity: 50,
      currentState: { fuelLevel: 80, rangeKm: 500 },
      efficiency: { estimated: 14, learned: 14.5, unit: 'km/l' },
    });

    expect(result.consumptionUnit).toBe('LITRES');
    expect(result.estimatedConsumption).toBe(10);
    expect(result.estimatedCost).toBe(1050);
    expect(result.sufficientInitialLevel).toBe(true);
    expect(result.requiredRefuelCount).toBe(0);
  });

  it('flags EV trips that exceed remaining range', () => {
    const result = calculateEnergy(400, {
      fuelType: 'EV',
      tankCapacity: 40,
      currentState: { batteryLevel: 20, rangeKm: 80 },
      efficiency: { estimated: 7, unit: 'km/kWh' },
    });

    expect(result.consumptionUnit).toBe('KWH');
    expect(result.sufficientInitialLevel).toBe(false);
    expect(result.requiredRefuelCount).toBeGreaterThan(0);
  });
});
