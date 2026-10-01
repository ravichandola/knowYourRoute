import { apiClient } from './client';
import { User, TripPreference } from '@know-your-route/types';

export const userApi = {
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>('/users/me');
  },

  markOnboarded: async (): Promise<User> => {
    return apiClient.patch<User>('/users/me/onboarded');
  },

  getPreferences: async (): Promise<TripPreference> => {
    return apiClient.get<TripPreference>('/users/me/preferences');
  },

  updatePreferences: async (preferences: TripPreference): Promise<TripPreference> => {
    return apiClient.patch<TripPreference>('/users/me/preferences', preferences);
  },
};
