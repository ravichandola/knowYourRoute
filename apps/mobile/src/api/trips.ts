import { apiClient } from './client';
import { Trip, TripExplanation } from '@know-your-route/types';
import { CreateTripInput } from '@know-your-route/validation';

export const tripApi = {
  listTrips: async (userId?: string): Promise<Trip[]> => {
    return apiClient.get<Trip[]>('/trips', { userId });
  },

  getTrip: async (id: string): Promise<Trip> => {
    return apiClient.get<Trip>(`/trips/${id}`);
  },

  createTrip: async (data: CreateTripInput, userId?: string): Promise<Trip> => {
    return apiClient.post<Trip>('/trips', data);
  },

  getTripExplanation: async (id: string): Promise<TripExplanation> => {
    return apiClient.get<TripExplanation>(`/trips/${id}/explain`);
  },
};
