import type { RoutePlanRequest, RouteProfile } from '@know-your-route/contracts';

export const ROUTING_PORT = 'ROUTING_PORT';
/** Candidate routes between two points (maps/directions engine). */
export interface RoutingPort {
  calculateRoutes(request: RoutePlanRequest): Promise<RouteProfile[]>;
}
