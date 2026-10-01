import { Module } from '@nestjs/common';
import { FastagController } from './fastag.controller';
import { FastagService } from './fastag.service';

@Module({
  controllers: [FastagController],
  providers: [FastagService],
  exports: [FastagService],
})
export class FastagModule {}
