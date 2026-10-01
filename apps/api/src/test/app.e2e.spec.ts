import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';

/**
 * Boots the real AppModule with the same pipeline as `main.ts` (configureApp), using the in-memory
 * persistence driver and no Redis so it needs no infrastructure. Blank values stop a developer's
 * local `.env` from leaking into the run.
 */
const TEST_ENV: Record<string, string> = {
  NODE_ENV: 'test',
  PERSISTENCE_DRIVER: 'memory',
  DATABASE_URL: '',
  REDIS_URL: '',
  JWT_SECRET: 'e2e-secret-e2e-secret-e2e-secret-1234',
  JWT_ISSUER: 'know-your-route',
  JWT_AUDIENCE: 'know-your-route',
  LOG_LEVEL: 'error',
  STORAGE_ENABLED: 'false',
  CORS_ORIGINS: 'https://app.example.com',
  RATE_LIMIT_MAX: '1000',
};

type CacheStub = {
  mode: 'redis' | 'memory';
  ping: () => Promise<boolean>;
  get: () => Promise<null>;
  set: () => Promise<void>;
  del: () => Promise<void>;
};

async function createApp(cacheOverride?: CacheStub): Promise<INestApplication> {
  Object.assign(process.env, TEST_ENV);
  // Imported lazily so the env above is in place before ConfigModule/decorators evaluate.
  const { AppModule } = await import('../app.module');
  const { configureApp } = await import('../platform/http/bootstrap');
  const { CacheService } = await import('../platform/cache/cache.service');

  let builder = Test.createTestingModule({ imports: [AppModule] });
  if (cacheOverride) {
    builder = builder.overrideProvider(CacheService).useValue(cacheOverride);
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({
    bodyParser: false,
    bufferLogs: true,
  });
  configureApp(app);
  await app.init();
  return app;
}

describe('API (e2e, in-memory)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('GET /health is public and unprefixed', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /health/ready reports dependencies', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.info).toHaveProperty('database');
    expect(res.body.info).toHaveProperty('redis');
  });

  it('returns a request id on every response and echoes a valid inbound one', async () => {
    const generated = await request(app.getHttpServer()).get('/health');
    expect(generated.headers['x-request-id']).toMatch(/^[\w.-]{8,128}$/);

    const echoed = await request(app.getHttpServer())
      .get('/health')
      .set('x-request-id', 'client-trace-12345');
    expect(echoed.headers['x-request-id']).toBe('client-trace-12345');
  });

  it('replaces an unsafe inbound request id', async () => {
    const res = await request(app.getHttpServer()).get('/health').set('x-request-id', 'bad id\twith spaces');
    expect(res.headers['x-request-id']).not.toContain(' ');
  });

  it('sets security headers', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('rejects unauthenticated access with the standard error envelope', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: expect.any(String),
        requestId: res.headers['x-request-id'],
      },
    });
  });

  it('rejects an invalid bearer token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer not-a-real-token')
      .expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('returns a validation error envelope with details', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email' })
      .expect(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.requestId).toBe(res.headers['x-request-id']);
  });

  it('returns a not-found envelope for unknown routes', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/nope').expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('rejects oversized bodies', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'a@b.co', password: 'x'.repeat(2 * 1024 * 1024) });
    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
    expect(res.body.error.requestId).toBe(res.headers['x-request-id']);
  });

  it('returns 400 (not 500) for malformed JSON', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.requestId).toBe(res.headers['x-request-id']);
  });

  it('allows only configured CORS origins', async () => {
    const allowed = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'https://app.example.com');
    expect(allowed.headers['access-control-allow-origin']).toBe('https://app.example.com');

    const denied = await request(app.getHttpServer()).get('/health').set('Origin', 'https://evil.example.com');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('does not expose Swagger in the test environment', async () => {
    await request(app.getHttpServer()).get('/api/docs').expect(404);
  });

  it('demo login issues a token that authenticates later requests', async () => {
    const login = await request(app.getHttpServer()).post('/api/v1/auth/demo-login').expect(201);
    expect(login.body.token).toEqual(expect.any(String));

    const me = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200);
    expect(me.body.id).toEqual(expect.any(String));
  });
});

describe('API (e2e, dependency down)', () => {
  it('readiness returns 503 with the dependency report when Redis is configured but unreachable', async () => {
    const app = await createApp({
      mode: 'redis',
      ping: async () => false,
      get: async () => null,
      set: async () => undefined,
      del: async () => undefined,
    });
    try {
      const res = await request(app.getHttpServer()).get('/health/ready').expect(503);
      expect(res.body.status).toBe('error');
      expect(res.body.error.redis.status).toBe('down');

      await request(app.getHttpServer()).get('/health').expect(200);
    } finally {
      await app.close();
    }
  });
});
