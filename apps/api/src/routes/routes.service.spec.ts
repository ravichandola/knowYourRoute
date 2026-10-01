import { RoutesService } from './routes.service';
import { MockMapsAdapter } from '../providers/maps/mock-maps.adapter';
import { MockWeatherAdapter } from '../providers/weather/mock-weather.adapter';
import { MockFastagAdapter } from '../providers/fastag/mock-fastag.adapter';
import { MockVehicleAdapter } from '../providers/vehicle/mock-vehicle.adapter';
import { EnergyService } from '../energy/energy.service';
import { SafetyService } from '../safety/safety.service';
import { FastagService } from '../fastag/fastag.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { RedisService } from '../common/services/redis.service';
import { DEMO_USER_ID } from '../auth/auth.constants';

describe('RoutesService (Route Intelligence Engine)', () => {
  let routesService: RoutesService;

  beforeEach(() => {
    const mapsProvider = new MockMapsAdapter();
    const weatherProvider = new MockWeatherAdapter();
    const fastagProvider = new MockFastagAdapter();
    const vehicleProvider = new MockVehicleAdapter();
    const energyService = new EnergyService();
    const safetyService = new SafetyService();
    const mockPrisma = {
      vehicle: { findUnique: jest.fn().mockRejectedValue(new Error('db offline')) },
    } as any;
    const vehiclesService = new VehiclesService(vehicleProvider, mockPrisma);
    const mockConfig = { get: jest.fn().mockReturnValue(undefined) } as any;
    const redisService = new RedisService(mockConfig);
    const fastagPrisma = {
      fastagConnection: {
        findFirst: jest.fn().mockRejectedValue(new Error('db offline')),
        findMany: jest.fn().mockRejectedValue(new Error('db offline')),
      },
    } as any;
    const fastagService = new FastagService(fastagProvider, fastagPrisma);

    routesService = new RoutesService(
      mapsProvider,
      weatherProvider,
      energyService,
      safetyService,
      fastagService,
      vehiclesService,
      redisService
    );
  });

  it('should plan and enrich candidate routes with safety, energy, and toll intelligence', async () => {
    const response = await routesService.planRoute(
      {
        origin: { name: 'Mumbai', location: { latitude: 18.9696, longitude: 72.8193 } },
        destination: { name: 'Pune', location: { latitude: 18.5314, longitude: 73.8446 } },
        vehicleId: 'veh_demo_creta',
      },
      DEMO_USER_ID
    );

    expect(response).toBeDefined();
    expect(response.routes.length).toBeGreaterThanOrEqual(2);

    const fastest = response.routes[0];
    expect(fastest.distanceKm).toBeGreaterThan(0);
    expect(fastest.durationMinutes).toBeGreaterThan(0);
    expect(fastest.toll.totalCost).toBeGreaterThan(0);
    expect(fastest.energy.estimatedCost).toBeGreaterThan(0);
    expect(fastest.safety.overallScore).toBeGreaterThanOrEqual(80);
    expect(fastest.fastag).toBeDefined();
    expect(fastest.fastag?.isBalanceSufficientForTrip).toBe(true);
  });
});
