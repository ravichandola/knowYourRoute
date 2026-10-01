import { configureApiAuth } from '@/shared/api';
import { useAuthStore } from '@/features/auth';

/**
 * Composition point of the app: connects the transport (shared/api) to the auth state
 * (features/auth) so neither of them has to know about the other.
 */
configureApiAuth({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.getState().logout(),
});
