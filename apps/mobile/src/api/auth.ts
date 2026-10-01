import { apiClient } from './client';
import { AuthResponse, User } from '@know-your-route/types';
import { LoginInput, SignupInput } from '@know-your-route/validation';

export const authApi = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', input);
  },

  signup: async (input: SignupInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/signup', input);
  },

  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },
};
