import { BaseApiClient, createApiClient } from '@know-your-route/api-client';
import { ENV } from '../config/env';

/** Transport shared by the whole app. Auth is attached at startup via `configureApiAuth`. */
const http = new BaseApiClient({
  baseUrl: ENV.API_BASE_URL,
  timeoutMs: 12000,
});

/**
 * Typed SDK generated from `@know-your-route/contracts`: `api.<contract>.<endpoint>(...)`.
 * Every backend call in the app goes through this object.
 */
export const api = createApiClient(http);

export function configureApiAuth(auth: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  http.configure({ getAuthToken: auth.getToken, onUnauthorized: auth.onUnauthorized });
}
