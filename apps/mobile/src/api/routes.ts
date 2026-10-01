import { apiClient } from './client';
import { RoutePlanRequest, RoutePlanResponse } from '@know-your-route/types';

export const routeApi = {
  planRoute: async (request: RoutePlanRequest): Promise<RoutePlanResponse> => {
    return apiClient.post<RoutePlanResponse>('/routes/plan', request);
  },
};
