import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { selectByConfig } from '../../platform/config/select-by-config';
import { VehiclesModule } from '../vehicles';
import { TripsService } from './application/trips.service';
import { TRIP_EXPLAINER } from './domain/trip-explainer.port';
import { TRIP_REPOSITORY } from './domain/trip.repository';
import { TRIP_VEHICLE_LOOKUP } from './domain/vehicle-lookup.port';
import { TripsController } from './http/trips.controller';
import { InMemoryTripRepository } from './infrastructure/in-memory-trip.repository';
import { MockTripExplainerAdapter } from './infrastructure/mock-trip-explainer.adapter';
import { VehicleLookupAdapter } from './infrastructure/vehicle-lookup.adapter';

@Module({
  imports: [ConfigModule, VehiclesModule],
  controllers: [TripsController],
  providers: [
    TripsService,
    // Trips have no Prisma implementation yet; they are always kept in memory.
    { provide: TRIP_REPOSITORY, useClass: InMemoryTripRepository },
    { provide: TRIP_VEHICLE_LOOKUP, useClass: VehicleLookupAdapter },
    MockTripExplainerAdapter,
    {
      provide: TRIP_EXPLAINER,
      useFactory: (config: ConfigService, mock: MockTripExplainerAdapter) =>
        selectByConfig(config, 'AI_PROVIDER', { mock }, 'mock'),
      inject: [ConfigService, MockTripExplainerAdapter],
    },
  ],
})
export class TripsModule {}
