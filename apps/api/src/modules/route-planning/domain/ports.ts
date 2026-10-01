import type {
  FastagContext,
  LatLng,
  RoutePlanRequest,
  RouteProfile,
  VehicleProfile,
  WeatherContext,
} from '@know-your-route/contracts';

/**
 * Everything route planning needs from the outside world, declared from ITS point of view.
 * Adapters in `infrastructure/` implement these; the use case never knows who is behind them.
 */

export const ROUTING_PORT = 'ROUTING_PORT';
/** Candidate routes between two points (maps/directions engine). */
export interface RoutingPort {
  calculateRoutes(request: RoutePlanRequest): Promise<RouteProfile[]>;
}

export const WEATHER_PORT = 'WEATHER_PORT';
export interface WeatherPort {
  getWeatherAlongRoute(points: LatLng[]): Promise<WeatherContext>;
}

export const VEHICLE_LOOKUP_PORT = 'VEHICLE_LOOKUP_PORT';
export interface VehicleLookupPort {
  /** Returns `undefined` when the vehicle does not exist or is not accessible to the user. */
  findForPlanning(vehicleId: string, userId?: string): Promise<VehicleProfile | undefined>;
}

export const TOLL_BALANCE_PORT = 'TOLL_BALANCE_PORT';
export interface TollBalancePort {
  /** Returns `undefined` when the user has no FASTag to check against. */
  checkTollSufficiency(query: {
    userId?: string;
    vehicleId?: string;
    tollCost: number;
  }): Promise<FastagContext | undefined>;
}

export const PLAN_CACHE_PORT = 'PLAN_CACHE_PORT';
export interface PlanCachePort {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
}
