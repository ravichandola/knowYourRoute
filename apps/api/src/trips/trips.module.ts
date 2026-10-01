import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { AIModule } from '../ai/ai.module';
import { PrismaService } from '../common/prisma.service';

@Module({
  imports: [VehiclesModule, AIModule],
  controllers: [TripsController],
  providers: [TripsService, PrismaService],
  exports: [TripsService],
})
export class TripsModule {}
