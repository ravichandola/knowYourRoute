import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { getPersistenceDriver } from '../config/persistence-driver';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly config: ConfigService) {
    super();
  }

  private get isEnabled(): boolean {
    return getPersistenceDriver(this.config) === 'prisma';
  }

  async onModuleInit() {
    if (!this.isEnabled) {
      this.logger.log('PERSISTENCE_DRIVER=memory: Prisma connection skipped');
      return;
    }
    await this.$connect();
    this.logger.log('Connected to PostgreSQL via Prisma');
  }

  async onModuleDestroy() {
    if (this.isEnabled) {
      await this.$disconnect();
    }
  }
}
