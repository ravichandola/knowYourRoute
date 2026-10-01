import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { EnergyModule } from '../energy/energy.module';
import { SafetyModule } from '../safety/safety.module';
import { FastagModule } from '../fastag/fastag.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { RedisService } from '../common/services/redis.service';

@Module({
  imports: [EnergyModule, SafetyModule, FastagModule, VehiclesModule],
  controllers: [RoutesController],
  providers: [RoutesService, RedisService],
  exports: [RoutesService],
})
export class RoutesModule {}
