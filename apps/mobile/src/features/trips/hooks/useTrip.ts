import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { useAuthStore } from '@/features/auth';
import type { CreateTripInput, RouteProfile, Waypoint } from '@know-your-route/contracts';
import { useActiveTripStore } from '../store/active-trip.store';

export const useUserTrips = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['trips', user?.id],
    queryFn: () => api.trips.list(),
  });
};

export const useTripDetail = (tripId: string) => {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.trips.get({ params: { id: tripId } }),
    enabled: !!tripId,
  });
};

export const useTripExplanation = (tripId: string) => {
  return useQuery({
    queryKey: ['tripExplanation', tripId],
    queryFn: () => api.trips.explain({ params: { id: tripId } }),
    enabled: !!tripId,
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTripInput) => api.trips.create({ body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};

export interface StartTripInput {
  vehicleId: string;
  origin: Waypoint;
  destination: Waypoint;
  route: RouteProfile;
}

/** Creates the trip on the server and remembers the chosen route for the live trip screen. */
export const useStartTrip = () => {
  const queryClient = useQueryClient();
  const setActiveTrip = useActiveTripStore((s) => s.setActiveTrip);

  return useMutation({
    mutationFn: ({ vehicleId, origin, destination, route }: StartTripInput) =>
      api.trips.create({
        body: { vehicleId, origin, destination, selectedRouteId: route.id },
      }),
    onSuccess: (trip, { origin, destination, route }) => {
      setActiveTrip({ trip, route, origin, destination });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};
