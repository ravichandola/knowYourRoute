import { Injectable } from '@nestjs/common';
import { CacheService } from '../../../../platform/cache/cache.service';
import type { PlanCachePort } from '../../domain/ports';

/** Route planning -> platform cache (Redis with in-memory fallback). */
@Injectable()
export class PlanCacheAdapter implements PlanCachePort {
  constructor(private readonly cache: CacheService) {}

  get<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key);
  }

  set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    return this.cache.set(key, value, ttlSeconds);
  }
}
