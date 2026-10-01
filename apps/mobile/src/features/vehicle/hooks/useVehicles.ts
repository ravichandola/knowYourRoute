import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../../../api/vehicle';
import { useAuthStore } from '../../../stores/auth.store';
import { useVehicleStore } from '../../../stores/vehicle.store';
import { VehicleProfileInput, VehicleSnapshotInput } from '@know-your-route/validation';

export const useVehicles = () => {
  const user = useAuthStore((s) => s.user);
  const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);

  return useQuery({
    queryKey: ['vehicles', user?.id],
    queryFn: async () => {
      const list = await vehicleApi.listVehicles(user?.id);
      if (list.length > 0) {
        setSelectedVehicle(list[0]);
      }
      return list;
    },
  });
};

export const useRegisterVehicle = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);

  return useMutation({
    mutationFn: (input: VehicleProfileInput) =>
      vehicleApi.registerVehicle(input, user?.id),
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
      vehicleApi.uploadSnapshot(vehicleId, input),
    onSuccess: (updated) => {
      setSelectedVehicle(updated);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
