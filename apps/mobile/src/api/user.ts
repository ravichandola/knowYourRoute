import { apiClient } from './client';
import { User, TripPreference } from '@know-your-route/types';

export const userApi = {
  getProfile: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  markOnboarded: async (id: string): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}/onboarded`);
  },

  getPreferences: async (id: string): Promise<TripPreference> => {
    return apiClient.get<TripPreference>(`/users/${id}/preferences`);
  },

  updatePreferences: async (id: string, preferences: TripPreference): Promise<TripPreference> => {
    return apiClient.patch<TripPreference>(`/users/${id}/preferences`, preferences);
  },
};
