import { useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { RoutePlanRequest, RoutePlanResponse } from '@know-your-route/contracts';
import { useRouteStore } from '../store/route.store';

export const usePlanRoute = () => {
  const setSelectedRoute = useRouteStore((s) => s.setSelectedRoute);

  return useMutation({
    mutationFn: (request: RoutePlanRequest) => api.routes.plan({ body: request }),
    onSuccess: (data: RoutePlanResponse) => {
      if (data.routes && data.routes.length > 0) {
        const recommended = data.routes.find((r) => r.isRecommended) || data.routes[0];
        setSelectedRoute(recommended);
      }
    },
  });
};
