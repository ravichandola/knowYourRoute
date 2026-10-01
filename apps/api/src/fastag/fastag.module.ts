import { Module } from '@nestjs/common';
import { FastagController } from './fastag.controller';
import { FastagService } from './fastag.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [FastagController],
  providers: [FastagService, PrismaService],
  exports: [FastagService],
})
export class FastagModule {}
