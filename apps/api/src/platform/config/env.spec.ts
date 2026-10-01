import { validateEnv } from './env';

const validDev = {
  NODE_ENV: 'development',
  PORT: '4000',
  JWT_SECRET: 'dev-jwt-secret-know-your-route-2026-auth-token-key',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/know_your_route?schema=public',
  PERSISTENCE_DRIVER: 'prisma',
};

describe('validateEnv', () => {
  it('accepts valid development configuration', () => {
    const config = validateEnv(validDev);
    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(4000);
    expect(config.PERSISTENCE_DRIVER).toBe('prisma');
  });

  it('applies defaults for missing optional fields', () => {
    const config = validateEnv({ JWT_SECRET: 'some-test-secret', DATABASE_URL: 'postgresql://localhost:5432/db' });
    expect(config.PORT).toBe(4000);
    expect(config.HOST).toBe('0.0.0.0');
    expect(config.STORAGE_ENABLED).toBe(false);
    expect(config.BODY_LIMIT).toBe('1mb');
  });

  it('rejects production without DATABASE_URL', () => {
    expect(() =>
      validateEnv({ ...validDev, NODE_ENV: 'production', REDIS_URL: 'redis://r', CORS_ORIGINS: 'https://app.example.com', JWT_SECRET: 'a'.repeat(32), DATABASE_URL: undefined, PERSISTENCE_DRIVER: 'prisma' }),
    ).toThrow('DATABASE_URL');
  });

  it('rejects production with weak JWT_SECRET', () => {
    expect(() =>
      validateEnv({ ...validDev, NODE_ENV: 'production', REDIS_URL: 'redis://r', CORS_ORIGINS: 'https://x.com', PERSISTENCE_DRIVER: 'prisma', JWT_SECRET: 'dev-short' }),
    ).toThrow('JWT_SECRET');
  });

  it('rejects production without CORS_ORIGINS', () => {
    expect(() =>
      validateEnv({ ...validDev, NODE_ENV: 'production', REDIS_URL: 'redis://r', JWT_SECRET: 'a'.repeat(32), PERSISTENCE_DRIVER: 'prisma' }),
    ).toThrow('CORS_ORIGINS');
  });

  it('rejects production without REDIS_URL', () => {
    expect(() =>
      validateEnv({ ...validDev, NODE_ENV: 'production', CORS_ORIGINS: 'https://x.com', JWT_SECRET: 'a'.repeat(32), PERSISTENCE_DRIVER: 'prisma' }),
    ).toThrow('REDIS_URL');
  });

  it('rejects test env with non-test DATABASE_URL', () => {
    expect(() =>
      validateEnv({ ...validDev, NODE_ENV: 'test', DATABASE_URL: 'postgresql://localhost:5432/know_your_route' }),
    ).toThrow('test');
  });

  it('accepts test env with test DATABASE_URL', () => {
    const config = validateEnv({ ...validDev, NODE_ENV: 'test', DATABASE_URL: 'postgresql://localhost:5432/know_your_route_test' });
    expect(config.NODE_ENV).toBe('test');
  });

  it('requires DATABASE_URL when PERSISTENCE_DRIVER=prisma', () => {
    expect(() =>
      validateEnv({ JWT_SECRET: 'a-secret', PERSISTENCE_DRIVER: 'prisma' }),
    ).toThrow('DATABASE_URL');
  });

  it('allows memory driver without DATABASE_URL', () => {
    const config = validateEnv({ JWT_SECRET: 'a-secret', PERSISTENCE_DRIVER: 'memory' });
    expect(config.PERSISTENCE_DRIVER).toBe('memory');
  });
});
