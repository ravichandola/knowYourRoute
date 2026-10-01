import { createEndpointFactory } from '../http';
import { routePlanRequestSchema } from './schemas';
import type { RoutePlanResponse } from './route.types';

const ROUTES_BASE_PATH = 'routes';
const e = createEndpointFactory(ROUTES_BASE_PATH);

export const routesContract = {
  basePath: ROUTES_BASE_PATH,
  plan: e.post<RoutePlanResponse>()('/plan', { body: routePlanRequestSchema }),
} as const;
