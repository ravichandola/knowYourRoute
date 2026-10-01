import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '../../platform/cache/cache.module';
import { selectByConfig } from '../../platform/config/select-by-config';
import { FastagModule } from '../fastag';
import { VehiclesModule } from '../vehicles';
import { PlanRouteUseCase } from './application/plan-route.use-case';
import {
  PLAN_CACHE_PORT,
  ROUTING_PORT,
  TOLL_BALANCE_PORT,
  VEHICLE_LOOKUP_PORT,
  WEATHER_PORT,
} from './domain/ports';
import { RoutesController } from './http/routes.controller';
import { MockMapsAdapter } from './infrastructure/maps/mock-maps.adapter';
import { PlanCacheAdapter } from './infrastructure/plan-cache.adapter';
import { TollBalanceAdapter } from './infrastructure/toll-balance.adapter';
import { VehicleLookupAdapter } from './infrastructure/vehicle-lookup.adapter';
import { MockWeatherAdapter } from './infrastructure/weather/mock-weather.adapter';

@Module({
  imports: [ConfigModule, CacheModule, VehiclesModule, FastagModule],
  controllers: [RoutesController],
  providers: [
    PlanRouteUseCase,
    MockMapsAdapter,
    MockWeatherAdapter,
    {
      provide: ROUTING_PORT,
      useFactory: (config: ConfigService, mock: MockMapsAdapter) =>
        selectByConfig(config, 'MAP_PROVIDER', { mock }, 'mock'),
      inject: [ConfigService, MockMapsAdapter],
    },
    {
      provide: WEATHER_PORT,
      useFactory: (config: ConfigService, mock: MockWeatherAdapter) =>
        selectByConfig(config, 'WEATHER_PROVIDER', { mock }, 'mock'),
      inject: [ConfigService, MockWeatherAdapter],
    },
    { provide: VEHICLE_LOOKUP_PORT, useClass: VehicleLookupAdapter },
    { provide: TOLL_BALANCE_PORT, useClass: TollBalanceAdapter },
    { provide: PLAN_CACHE_PORT, useClass: PlanCacheAdapter },
  ],
})
export class RoutePlanningModule {}
