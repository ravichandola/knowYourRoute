import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL Database via Prisma');
    } catch (err: unknown) {
      this.logger.warn(
        `Database connection skipped or failed: ${(err as Error).message}. Operating in mock/in-memory fallback mode.`
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
