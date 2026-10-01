import type {
  FastagContext,
  RoutePlanRequest,
  VehicleProfile,
} from '@know-your-route/contracts';
import { DEMO_USER_ID, DEMO_VEHICLE_ID } from '../../../platform/demo/demo-data';
import { DEFAULT_PLANNING_VEHICLE } from '../domain/default-vehicle';
import type {
  PlanCachePort,
  TollBalancePort,
  VehicleLookupPort,
  WeatherPort,
} from '../domain/ports';
import { MockMapsAdapter } from '../infrastructure/maps/mock-maps.adapter';
import { MockWeatherAdapter } from '../infrastructure/weather/mock-weather.adapter';
import { PlanRouteUseCase } from './plan-route.use-case';

const request: RoutePlanRequest = {
  origin: { name: 'Mumbai', location: { latitude: 18.9696, longitude: 72.8193 } },
  destination: { name: 'Pune', location: { latitude: 18.5314, longitude: 73.8446 } },
  vehicleId: DEMO_VEHICLE_ID,
};

const creta: VehicleProfile = {
  id: DEMO_VEHICLE_ID,
  userId: DEMO_USER_ID,
  make: 'Hyundai',
  model: 'Creta',
  fuelType: 'PETROL',
  tankCapacity: 50,
  currentState: { fuelLevel: 72, rangeKm: 518 },
  efficiency: { estimated: 14.8, learned: 14.4, unit: 'km/l' },
  dataSource: 'USER_CONFIRMED',
};

const sufficientTag: FastagContext = {
  tagId: 'FT-1',
  bankName: 'Test Bank',
  currentBalance: 750,
  currency: 'INR',
  isBalanceSufficientForTrip: true,
  lowBalanceWarning: false,
  lastUpdated: new Date().toISOString(),
};

class MapCache implements PlanCachePort {
  readonly store = new Map<string, unknown>();
  async get<T>(key: string) {
    return (this.store.get(key) as T | undefined) ?? null;
  }
  async set(key: string, value: unknown) {
    this.store.set(key, value);
  }
}

describe('PlanRouteUseCase', () => {
  let vehicles: jest.Mocked<VehicleLookupPort>;
  let tolls: jest.Mocked<TollBalancePort>;
  let weather: jest.Mocked<WeatherPort>;
  let cache: MapCache;
  let useCase: PlanRouteUseCase;

  beforeEach(() => {
    vehicles = { findForPlanning: jest.fn().mockResolvedValue(creta) };
    tolls = { checkTollSufficiency: jest.fn().mockResolvedValue(sufficientTag) };
    const realWeather = new MockWeatherAdapter();
    weather = {
      getWeatherAlongRoute: jest.fn((points) => realWeather.getWeatherAlongRoute(points)),
    };
    cache = new MapCache();
    useCase = new PlanRouteUseCase(new MockMapsAdapter(), weather, vehicles, tolls, cache);
  });

  it('plans and enriches candidate routes with safety, energy, weather and toll intelligence', async () => {
    const response = await useCase.execute(request, DEMO_USER_ID);

    expect(response.routes.length).toBeGreaterThanOrEqual(2);
    const fastest = response.routes[0];
    expect(fastest.distanceKm).toBeGreaterThan(0);
    expect(fastest.toll.totalCost).toBeGreaterThan(0);
    expect(fastest.energy.estimatedCost).toBeGreaterThan(0);
    expect(fastest.safety.overallScore).toBeGreaterThanOrEqual(80);
    expect(fastest.fastag?.isBalanceSufficientForTrip).toBe(true);
  });

  it('asks the ports exactly what it needs and only once for shared data', async () => {
    const response = await useCase.execute(request, DEMO_USER_ID);

    expect(vehicles.findForPlanning).toHaveBeenCalledWith(DEMO_VEHICLE_ID, DEMO_USER_ID);
    expect(weather.getWeatherAlongRoute).toHaveBeenCalledTimes(1);
    expect(tolls.checkTollSufficiency).toHaveBeenCalledTimes(response.routes.length);
    expect(tolls.checkTollSufficiency).toHaveBeenCalledWith(
      expect.objectContaining({ userId: DEMO_USER_ID, vehicleId: DEMO_VEHICLE_ID })
    );
  });

  it('serves repeated requests from the cache', async () => {
    const first = await useCase.execute(request, DEMO_USER_ID);
    const second = await useCase.execute(request, DEMO_USER_ID);

    expect(second).toBe(first);
    expect(vehicles.findForPlanning).toHaveBeenCalledTimes(1);
  });

  it('falls back to the default planning vehicle when the vehicle is unknown', async () => {
    vehicles.findForPlanning.mockResolvedValue(undefined);
    const response = await useCase.execute(request, DEMO_USER_ID);

    expect(response.routes[0].energy.fuelType).toBe(DEFAULT_PLANNING_VEHICLE.fuelType);
  });

  it('omits FASTag data when the user has no tag', async () => {
    tolls.checkTollSufficiency.mockResolvedValue(undefined);
    const response = await useCase.execute({ ...request, vehicleId: undefined }, DEMO_USER_ID);

    expect(vehicles.findForPlanning).not.toHaveBeenCalled();
    expect(response.routes.every((route) => route.fastag === undefined)).toBe(true);
  });
});
