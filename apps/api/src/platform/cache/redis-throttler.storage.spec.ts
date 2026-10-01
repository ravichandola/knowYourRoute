import { RedisThrottlerStorage } from './redis-throttler.storage';
import type { CacheService } from './cache.service';

describe('RedisThrottlerStorage', () => {
  it('prefixes keys and reports remaining TTL in seconds', async () => {
    const increment = jest.fn().mockResolvedValue({ hits: 4, timeToExpireMs: 1500 });
    const storage = new RedisThrottlerStorage({ increment } as unknown as CacheService);

    await expect(storage.increment('ip:1', 60_000)).resolves.toEqual({ totalHits: 4, timeToExpire: 2 });
    expect(increment).toHaveBeenCalledWith('throttle:ip:1', 60_000);
  });
});
