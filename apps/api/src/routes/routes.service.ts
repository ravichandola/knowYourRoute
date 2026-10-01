import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  RoutePlanRequest,
  RoutePlanResponse,
  RouteProfile,
  VehicleProfile,
} from '@know-your-route/types';
import { MAPS_PROVIDER, IMapsProvider } from '../providers/maps/maps.interface';
import { WEATHER_PROVIDER, IWeatherProvider } from '../providers/weather/weather.interface';
import { EnergyService } from '../energy/energy.service';
import { SafetyService } from '../safety/safety.service';
import { FastagService } from '../fastag/fastag.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { RedisService } from '../common/services/redis.service';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(
    @Inject(MAPS_PROVIDER) private mapsProvider: IMapsProvider,
    @Inject(WEATHER_PROVIDER) private weatherProvider: IWeatherProvider,
    private energyService: EnergyService,
    private safetyService: SafetyService,
    private fastagService: FastagService,
    private vehiclesService: VehiclesService,
    private redisService: RedisService
  ) {}

  async planRoute(request: RoutePlanRequest, userId?: string): Promise<RoutePlanResponse> {
    const cacheKey = `route_plan:${request.origin.location.latitude.toFixed(3)},${request.origin.location.longitude.toFixed(3)}_${request.destination.location.latitude.toFixed(3)},${request.destination.location.longitude.toFixed(3)}_${request.vehicleId || 'default'}`;

    // 1. Check Redis Cache
    const cached = await this.redisService.get<RoutePlanResponse>(cacheKey);
    if (cached) {
      this.logger.log(`Returning cached route plan for ${cacheKey}`);
      return cached;
    }

    // 2. Fetch Vehicle Profile for intelligence calculations
    let vehicle: Partial<VehicleProfile> = {
      make: 'Hyundai',
      model: 'Creta',
      fuelType: 'PETROL',
      tankCapacity: 50,
      currentState: { fuelLevel: 70, rangeKm: 480 },
    };

    if (request.vehicleId) {
      try {
        vehicle = await this.vehiclesService.getVehicle(request.vehicleId, userId);
      } catch {
        // Use default vehicle profile if ID not found
      }
    }

    // 3. Route Generation (Maps Provider)
    const rawRoutes = await this.mapsProvider.calculateRoutes(request);

    // 4. Route Enrichment Pipeline (Energy, Safety, Weather, FASTag)
    const enrichedRoutes: RouteProfile[] = await Promise.all(
      rawRoutes.map(async (route) => {
        // Energy Intelligence
        const energy = this.energyService.calculateEnergy(
          route.distanceKm,
          vehicle,
          route.road.highwayPercentage
        );

        // Safety Engine
        const safety = this.safetyService.evaluateSafety(
          route.distanceKm,
          route.road.highwayPercentage
        );

        // Weather Intelligence
        const weather = await this.weatherProvider.getWeatherAlongRoute([
          request.origin.location,
          request.destination.location,
        ]);

        const tagNumber = await this.fastagService.resolveTagNumber(userId, request.vehicleId);
        const fastag = tagNumber
          ? await this.fastagService.verifyTollSufficiency(tagNumber, route.toll.totalCost)
          : undefined;

        return {
          ...route,
          energy,
          safety,
          weather,
          fastag,
        };
      })
    );

    const response: RoutePlanResponse = {
      searchId: `srch_${Date.now()}`,
      origin: request.origin,
      destination: request.destination,
      routes: enrichedRoutes,
      generatedAt: new Date().toISOString(),
    };

    // Cache results for 10 minutes (600s)
    await this.redisService.set(cacheKey, response, 600);

    return response;
  }
}
