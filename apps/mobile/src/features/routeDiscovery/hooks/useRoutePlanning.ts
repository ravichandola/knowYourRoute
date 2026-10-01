import { useMutation } from '@tanstack/react-query';
import { routeApi } from '../../../api/routes';
import { RoutePlanRequest, RoutePlanResponse } from '@know-your-route/types';
import { useRouteStore } from '../../../stores/route.store';

export const usePlanRoute = () => {
  const setSelectedRoute = useRouteStore((s) => s.setSelectedRoute);

  return useMutation({
    mutationFn: (request: RoutePlanRequest) => routeApi.planRoute(request),
    onSuccess: (data: RoutePlanResponse) => {
      if (data.routes && data.routes.length > 0) {
        const recommended = data.routes.find((r) => r.isRecommended) || data.routes[0];
        setSelectedRoute(recommended);
      }
    },
  });
};
