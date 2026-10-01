import { apiClient } from './client';
import { FastagContext } from '@know-your-route/types';

export const fastagApi = {
  getStatus: async (tagNumber: string): Promise<FastagContext> => {
    return apiClient.get<FastagContext>(`/fastag/${tagNumber}/status`);
  },

  verifySufficiency: async (tagNumber: string, tollCost: number): Promise<FastagContext> => {
    return apiClient.get<FastagContext>(`/fastag/${tagNumber}/verify`, { tollCost });
  },
};
