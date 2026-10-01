import { ApiError, BaseApiClient } from './http-client';

type FetchMock = jest.Mock<Promise<Response>, [string, RequestInit]>;

const json = (status: number, body: unknown, statusText = '') =>
  new Response(JSON.stringify(body), { status, statusText, headers: { 'content-type': 'application/json' } });

describe('BaseApiClient', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  const client = (overrides: Partial<ConstructorParameters<typeof BaseApiClient>[0]> = {}) =>
    new BaseApiClient({ baseUrl: 'https://api.example.com/api/v1/', timeoutMs: 200, ...overrides });

  it('joins the base URL and path without double slashes', async () => {
    fetchMock.mockResolvedValue(json(200, { ok: true }));
    await client().get('/users/me');
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.com/api/v1/users/me');
  });

  it('sends a fresh x-request-id on each request', async () => {
    fetchMock.mockImplementation(async () => json(200, {}));
    const api = client();
    await api.get('/a');
    await api.get('/b');
    const [first, second] = fetchMock.mock.calls.map(([, init]) => (init.headers as Record<string, string>)['x-request-id']);
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(first).not.toBe(second);
  });

  it('attaches the bearer token centrally and omits it when there is no token', async () => {
    fetchMock.mockImplementation(async () => json(200, {}));
    await client({ getAuthToken: async () => 'tok-123' }).get('/x');
    await client({ getAuthToken: () => null }).get('/x');
    expect((fetchMock.mock.calls[0][1].headers as Record<string, string>).Authorization).toBe('Bearer tok-123');
    expect((fetchMock.mock.calls[1][1].headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('normalizes the standard error envelope into ApiError', async () => {
    fetchMock.mockResolvedValue(
      json(400, {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', requestId: 'srv-req-1', details: [{ path: 'email' }] },
      }),
    );
    const error = await client().post('/auth/login', { email: 'x' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      requestId: 'srv-req-1',
      details: [{ path: 'email' }],
    });
  });

  it('falls back to the client request id when the error body is not an envelope', async () => {
    fetchMock.mockResolvedValue(new Response('<html>bad gateway</html>', { status: 500, statusText: 'Server Error' }));
    const error = (await client().post('/x', {}).catch((e: unknown) => e)) as ApiError;
    const sentId = (fetchMock.mock.calls[0][1].headers as Record<string, string>)['x-request-id'];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('UNKNOWN');
    expect(error.requestId).toBe(sentId);
  });

  it('calls onUnauthorized on 401', async () => {
    fetchMock.mockResolvedValue(json(401, { success: false, error: { code: 'AUTHENTICATION_ERROR', message: 'no', requestId: 'r' } }));
    const onUnauthorized = jest.fn();
    await client({ onUnauthorized }).get('/users/me').catch(() => undefined);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('retries GET on 503 and then succeeds', async () => {
    fetchMock
      .mockResolvedValueOnce(json(503, { success: false, error: { code: 'INTERNAL_ERROR', message: 'down', requestId: 'r' } }))
      .mockResolvedValueOnce(json(200, { ok: 1 }));
    await expect(client().get('/health')).resolves.toEqual({ ok: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  }, 10000);

  it('gives up after the maximum retries on a persistent 503', async () => {
    fetchMock.mockImplementation(async () => json(503, { success: false, error: { code: 'INTERNAL_ERROR', message: 'down', requestId: 'r' } }));
    await expect(client().get('/health')).rejects.toMatchObject({ statusCode: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  }, 10000);

  it('retries GET on network errors', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed')).mockResolvedValueOnce(json(200, { ok: 1 }));
    await expect(client().get('/x')).resolves.toEqual({ ok: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  }, 10000);

  it('never retries non-idempotent requests', async () => {
    fetchMock.mockResolvedValue(json(503, { success: false, error: { code: 'INTERNAL_ERROR', message: 'down', requestId: 'r' } }));
    await expect(client().post('/trips', {})).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockClear();
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    await expect(client().post('/trips', {})).rejects.toMatchObject({ code: 'NETWORK_ERROR', statusCode: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry client errors', async () => {
    fetchMock.mockResolvedValue(json(404, { success: false, error: { code: 'NOT_FOUND', message: 'no', requestId: 'r' } }));
    await expect(client().get('/missing')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('turns aborts into a TIMEOUT error', async () => {
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
        }),
    );
    await expect(client({ timeoutMs: 20 }).post('/slow', {})).rejects.toMatchObject({ code: 'TIMEOUT', statusCode: 408 });
  });

  it('returns an empty object for 204 responses', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(client().delete('/trips/1')).resolves.toEqual({});
  });

  it('serializes query params and skips undefined values', async () => {
    fetchMock.mockResolvedValue(json(200, {}));
    await client().get('/search', { q: 'a b', page: 2, skip: undefined });
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.com/api/v1/search?q=a+b&page=2');
  });
});
