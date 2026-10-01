import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { FastagModule } from './modules/fastag';
import { IdentityModule } from './modules/identity';
import { RoutePlanningModule } from './modules/route-planning';
import { TripsModule } from './modules/trips';
import { VehiclesModule } from './modules/vehicles';
import { CacheModule } from './platform/cache/cache.module';
import { RedisThrottlerStorage } from './platform/cache/redis-throttler.storage';
import { AppConfig, validateEnv } from './platform/config/env';
import { HealthModule } from './platform/health/health.module';
import { AppLoggingModule } from './platform/logging/logging.module';
import { StorageModule } from './platform/storage/storage.module';

/**
 * Composition root: the only file that knows every module exists.
 * Module-to-module dependencies are declared in each module's own `*.module.ts`.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
    }),
    AppLoggingModule,
    ThrottlerModule.forRootAsync({
      imports: [CacheModule],
      inject: [ConfigService, RedisThrottlerStorage],
      useFactory: (config: ConfigService<AppConfig, true>, storage: RedisThrottlerStorage) => ({
        storage,
        throttlers: [
          {
            ttl: config.get('RATE_LIMIT_TTL', { infer: true }) * 1000,
            limit: config.get('RATE_LIMIT_MAX', { infer: true }),
          },
        ],
      }),
    }),
    HealthModule,
    StorageModule,
    IdentityModule,
    VehiclesModule,
    FastagModule,
    RoutePlanningModule,
    TripsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
