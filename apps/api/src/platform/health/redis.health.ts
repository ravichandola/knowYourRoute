import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly cache: CacheService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (this.cache.mode === 'memory') {
      return this.getStatus(key, true, { mode: 'in-memory' });
    }
    if (await this.cache.ping()) {
      return this.getStatus(key, true, { mode: 'redis' });
    }
    throw new HealthCheckError('Redis check failed', this.getStatus(key, false, { message: 'Redis is not reachable' }));
  }
}
