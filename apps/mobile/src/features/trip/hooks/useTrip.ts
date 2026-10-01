import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi } from '../../../api/trips';
import { useAuthStore } from '../../../stores/auth.store';
import { CreateTripInput } from '@know-your-route/validation';

export const useUserTrips = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['trips', user?.id],
    queryFn: () => tripApi.listTrips(),
  });
};

export const useTripDetail = (tripId: string) => {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
    enabled: !!tripId,
  });
};

export const useTripExplanation = (tripId: string) => {
  return useQuery({
    queryKey: ['tripExplanation', tripId],
    queryFn: () => tripApi.getTripExplanation(tripId),
    enabled: !!tripId,
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTripInput) => tripApi.createTrip(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};
