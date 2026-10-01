import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';
import { RedisThrottlerStorage } from './redis-throttler.storage';

@Module({
  imports: [ConfigModule],
  providers: [CacheService, RedisThrottlerStorage],
  exports: [CacheService, RedisThrottlerStorage],
})
export class CacheModule {}
