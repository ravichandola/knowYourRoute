export interface ApiClientConfig {
  baseUrl: string;
  getAuthToken?: () => Promise<string | null> | string | null;
  timeoutMs?: number;
  onUnauthorized?: () => void;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'UNKNOWN',
    public requestId: string = '',
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const RETRYABLE_STATUS = new Set([502, 503, 504]);
const MAX_RETRIES = 2;

export class BaseApiClient {
  private baseUrl: string;
  private getAuthToken?: () => Promise<string | null> | string | null;
  private timeoutMs: number;
  private onUnauthorized?: () => void;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.getAuthToken = config.getAuthToken;
    this.timeoutMs = config.timeoutMs ?? 15000;
    this.onUnauthorized = config.onUnauthorized;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  public configure(config: Pick<ApiClientConfig, 'getAuthToken' | 'onUnauthorized'>) {
    if (config.getAuthToken) this.getAuthToken = config.getAuthToken;
    if (config.onUnauthorized) this.onUnauthorized = config.onUnauthorized;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const requestId = generateRequestId();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-request-id': requestId,
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.getAuthToken) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const method = (options.method ?? 'GET').toUpperCase();
    const isIdempotent = method === 'GET' || method === 'HEAD';

    let lastError: unknown;

    for (let attempt = 0; attempt <= (isIdempotent ? MAX_RETRIES : 0); attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, Math.min(attempt * 500, 2000)));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401 && this.onUnauthorized) {
            this.onUnauthorized();
          }

          let errorData: ApiErrorResponse | undefined;
          try {
            const json = await response.json();
            if (json && typeof json === 'object' && json.success === false && json.error) {
              errorData = json as ApiErrorResponse;
            }
          } catch {
            // response body not JSON
          }

          const err = errorData
            ? new ApiError(
                response.status,
                errorData.error.message,
                errorData.error.code,
                errorData.error.requestId,
                errorData.error.details,
              )
            : new ApiError(
                response.status,
                response.statusText || 'Network request failed',
                'UNKNOWN',
                requestId,
              );

          if (isIdempotent && RETRYABLE_STATUS.has(response.status) && attempt < MAX_RETRIES) {
            lastError = err;
            continue;
          }

          throw err;
        }

        if (response.status === 204) {
          return {} as T;
        }

        return (await response.json()) as T;
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          throw err;
        }

        if ((err as Error)?.name === 'AbortError') {
          lastError = new ApiError(408, 'Request timed out. Please check your connection.', 'TIMEOUT', requestId);
          if (!isIdempotent || attempt >= MAX_RETRIES) throw lastError;
          continue;
        }

        lastError = new ApiError(
          0,
          (err as Error)?.message || 'Network error, please verify your internet connection.',
          'NETWORK_ERROR',
          requestId,
        );
        if (!isIdempotent || attempt >= MAX_RETRIES) throw lastError;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastError;
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined) searchParams.append(key, String(val));
      });
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
