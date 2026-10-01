import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  RoutePlanRequest,
  RoutePlanResponse,
  RouteProfile,
  VehicleProfile,
} from '@know-your-route/contracts';
import { DEFAULT_PLANNING_VEHICLE } from '../domain/default-vehicle';
import { calculateEnergy } from '../domain/energy';
import { buildPlanCacheKey } from '../domain/plan-cache-key';
import {
  PLAN_CACHE_PORT,
  PlanCachePort,
  ROUTING_PORT,
  RoutingPort,
  TOLL_BALANCE_PORT,
  TollBalancePort,
  VEHICLE_LOOKUP_PORT,
  VehicleLookupPort,
  WEATHER_PORT,
  WeatherPort,
} from '../domain/ports';
import { evaluateSafety } from '../domain/safety';

const PLAN_CACHE_TTL_SECONDS = 600;

/**
 * Orchestrates one route-planning request:
 *   cache -> vehicle -> candidate routes -> (energy, safety, weather, FASTag) enrichment -> cache.
 * It only talks to ports and pure domain functions.
 */
@Injectable()
export class PlanRouteUseCase {
  private readonly logger = new Logger(PlanRouteUseCase.name);

  constructor(
    @Inject(ROUTING_PORT) private readonly routing: RoutingPort,
    @Inject(WEATHER_PORT) private readonly weather: WeatherPort,
    @Inject(VEHICLE_LOOKUP_PORT) private readonly vehicles: VehicleLookupPort,
    @Inject(TOLL_BALANCE_PORT) private readonly tolls: TollBalancePort,
    @Inject(PLAN_CACHE_PORT) private readonly cache: PlanCachePort
  ) {}

  async execute(request: RoutePlanRequest, userId?: string): Promise<RoutePlanResponse> {
    const cacheKey = buildPlanCacheKey(request);
    const cached = await this.cache.get<RoutePlanResponse>(cacheKey);
    if (cached) {
      this.logger.log(`Returning cached route plan for ${cacheKey}`);
      return cached;
    }

    const vehicle = await this.resolveVehicle(request.vehicleId, userId);
    const candidates = await this.routing.calculateRoutes(request);
    const weather = await this.weather.getWeatherAlongRoute([
      request.origin.location,
      request.destination.location,
    ]);

    const routes: RouteProfile[] = await Promise.all(
      candidates.map(async (route) => ({
        ...route,
        energy: calculateEnergy(route.distanceKm, vehicle),
        safety: evaluateSafety(route.distanceKm, route.road.highwayPercentage),
        weather,
        fastag: await this.tolls.checkTollSufficiency({
          userId,
          vehicleId: request.vehicleId,
          tollCost: route.toll.totalCost,
        }),
      }))
    );

    const response: RoutePlanResponse = {
      searchId: `srch_${Date.now()}`,
      origin: request.origin,
      destination: request.destination,
      routes,
      generatedAt: new Date().toISOString(),
    };

    await this.cache.set(cacheKey, response, PLAN_CACHE_TTL_SECONDS);
    return response;
  }

  private async resolveVehicle(
    vehicleId: string | undefined,
    userId: string | undefined
  ): Promise<Partial<VehicleProfile>> {
    if (!vehicleId) {
      return DEFAULT_PLANNING_VEHICLE;
    }
    return (await this.vehicles.findForPlanning(vehicleId, userId)) ?? DEFAULT_PLANNING_VEHICLE;
  }
}
