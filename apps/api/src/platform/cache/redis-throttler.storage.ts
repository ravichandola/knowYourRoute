import { Injectable } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import { CacheService } from './cache.service';

const KEY_PREFIX = 'throttle:';

/**
 * Shared rate-limit counters. When Redis is in use, every API instance sees the same count.
 * When Redis is not configured (dev/test), this process uses an in-memory counter.
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly cache: CacheService) {}

  async increment(key: string, ttl: number): Promise<{ totalHits: number; timeToExpire: number }> {
    const { hits, timeToExpireMs } = await this.cache.increment(`${KEY_PREFIX}${key}`, ttl);
    return {
      totalHits: hits,
      timeToExpire: Math.max(1, Math.ceil(timeToExpireMs / 1000)),
    };
  }
}
