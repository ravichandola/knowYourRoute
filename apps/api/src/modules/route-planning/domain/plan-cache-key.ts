import type { RoutePlanRequest } from '@know-your-route/contracts';

const PRECISION = 3;

export function buildPlanCacheKey(request: RoutePlanRequest): string {
  const point = ({ latitude, longitude }: { latitude: number; longitude: number }) =>
    `${latitude.toFixed(PRECISION)},${longitude.toFixed(PRECISION)}`;

  return `route_plan:${point(request.origin.location)}_${point(request.destination.location)}_${
    request.vehicleId || 'default'
  }`;
}
