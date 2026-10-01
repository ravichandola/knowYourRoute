import { apiClient } from './client';
import { VehicleProfile } from '@know-your-route/types';
import { VehicleProfileInput, VehicleSnapshotInput } from '@know-your-route/validation';

export const vehicleApi = {
  listVehicles: async (userId?: string): Promise<VehicleProfile[]> => {
    return apiClient.get<VehicleProfile[]>('/vehicles', { userId });
  },

  getVehicle: async (id: string): Promise<VehicleProfile> => {
    return apiClient.get<VehicleProfile>(`/vehicles/${id}`);
  },

  registerVehicle: async (data: VehicleProfileInput, userId?: string): Promise<VehicleProfile> => {
    return apiClient.post<VehicleProfile>('/vehicles', data);
  },

  uploadSnapshot: async (vehicleId: string, data: VehicleSnapshotInput): Promise<VehicleProfile> => {
    return apiClient.post<VehicleProfile>(`/vehicles/${vehicleId}/snapshot`, data);
  },

  syncTelemetry: async (vehicleId: string): Promise<VehicleProfile> => {
    return apiClient.post<VehicleProfile>(`/vehicles/${vehicleId}/sync-telemetry`);
  },
};
