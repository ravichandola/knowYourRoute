import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { useAuthStore } from '@/features/auth';
import { useVehicleStore } from '../store/vehicle.store';
import { VehicleProfileInput, VehicleSnapshotInput } from '@know-your-route/contracts';

export const useVehicles = () => {
  const user = useAuthStore((s) => s.user);
  const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);

  return useQuery({
    queryKey: ['vehicles', user?.id],
    queryFn: async () => {
      const list = await api.vehicles.list();
      if (list.length > 0) {
        setSelectedVehicle(list[0]);
      }
      return list;
    },
  });
};

export const useRegisterVehicle = () => {
  const queryClient = useQueryClient();
  const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);

  return useMutation({
    mutationFn: (input: VehicleProfileInput) => api.vehicles.register({ body: input }),
    onSuccess: (newVehicle) => {
      setSelectedVehicle(newVehicle);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUploadVehicleSnapshot = (vehicleId: string) => {
  const queryClient = useQueryClient();
  const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);

  return useMutation({
    mutationFn: (input: VehicleSnapshotInput) =>
      api.vehicles.uploadSnapshot({ params: { id: vehicleId }, body: input }),
    onSuccess: (updated) => {
      setSelectedVehicle(updated);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
