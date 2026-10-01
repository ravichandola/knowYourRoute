import { Module } from '@nestjs/common';
import { EnergyService } from './energy.service';

@Module({
  providers: [EnergyService],
  exports: [EnergyService],
})
export class EnergyModule {}
