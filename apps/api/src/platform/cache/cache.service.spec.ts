import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

const config = (values: Record<string, string | undefined>) =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService;

describe('CacheService', () => {
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });
  afterAll(() => jest.restoreAllMocks());

  it('uses an in-memory store when REDIS_URL is unset outside production', async () => {
    const cache = new CacheService(config({ NODE_ENV: 'development' }));
    await cache.onModuleInit();

    expect(cache.mode).toBe('memory');
    await cache.set('k', { a: 1 }, 60);
    await expect(cache.get('k')).resolves.toEqual({ a: 1 });
    await cache.del('k');
    await expect(cache.get('k')).resolves.toBeNull();
  });

  it('expires in-memory entries', async () => {
    const cache = new CacheService(config({ NODE_ENV: 'test' }));
    await cache.onModuleInit();
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
    await cache.set('k', 'v', 1);
    jest.setSystemTime(new Date('2026-01-01T00:00:02Z'));
    await expect(cache.get('k')).resolves.toBeNull();
    jest.useRealTimers();
  });

  it('fails fast in production when REDIS_URL is missing', async () => {
    const cache = new CacheService(config({ NODE_ENV: 'production' }));
    await expect(cache.onModuleInit()).rejects.toThrow('REDIS_URL is required in production');
  });

  it('fails fast in production when Redis is unreachable, without leaking the password', async () => {
    const cache = new CacheService(
      config({ NODE_ENV: 'production', REDIS_URL: 'redis://:supersecret@127.0.0.1:1' }),
    );
    const error = await cache.onModuleInit().catch((e: Error) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('Redis is unreachable at startup');
    expect((error as Error).message).not.toContain('supersecret');
  }, 20000);

  it('falls back to memory in development when Redis is unreachable', async () => {
    const cache = new CacheService(
      config({ NODE_ENV: 'development', REDIS_URL: 'redis://127.0.0.1:1' }),
    );
    await cache.onModuleInit();
    expect(cache.mode).toBe('memory');
    expect(await cache.ping()).toBe(false);
  }, 20000);
});
