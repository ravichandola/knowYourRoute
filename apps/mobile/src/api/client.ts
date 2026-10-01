import { BaseApiClient } from '@know-your-route/api-client';
import { ENV } from '../config/env';
import { useAuthStore } from '../stores/auth.store';

export const apiClient = new BaseApiClient({
  baseUrl: ENV.API_BASE_URL,
  getAuthToken: () => useAuthStore.getState().token,
  timeoutMs: 12000,
  onUnauthorized: () => {
    useAuthStore.getState().logout();
  },
});
