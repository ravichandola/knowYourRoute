import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../platform/database/database.module';
import { selectByConfig } from '../../platform/config/select-by-config';
import { repositoryProviders } from '../../platform/persistence/repository-provider';
import { VehiclesFacade } from './application/vehicles.facade';
import { VehiclesService } from './application/vehicles.service';
import { VEHICLE_DATA_PROVIDER } from './domain/vehicle-data.port';
import { VEHICLE_REPOSITORY, VehicleRepository } from './domain/vehicle.repository';
import { VehiclesController } from './http/vehicles.controller';
import { InMemoryVehicleRepository } from './infrastructure/in-memory-vehicle.repository';
import { MockVehicleDataAdapter } from './infrastructure/mock-vehicle-data.adapter';
import { PrismaVehicleRepository } from './infrastructure/prisma-vehicle.repository';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [VehiclesController],
  providers: [
    VehiclesService,
    VehiclesFacade,
    ...repositoryProviders<VehicleRepository>(VEHICLE_REPOSITORY, {
      memory: InMemoryVehicleRepository,
      prisma: PrismaVehicleRepository,
    }),
    MockVehicleDataAdapter,
    {
      provide: VEHICLE_DATA_PROVIDER,
      useFactory: (config: ConfigService, mock: MockVehicleDataAdapter) =>
        selectByConfig(config, 'VEHICLE_PROVIDER', { mock }, 'mock'),
      inject: [ConfigService, MockVehicleDataAdapter],
    },
  ],
  exports: [VehiclesFacade],
})
export class VehiclesModule {}
