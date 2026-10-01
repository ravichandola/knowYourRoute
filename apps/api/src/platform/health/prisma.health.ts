import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.prisma.isEnabled) {
      return this.getStatus(key, true, { driver: 'memory' });
    }
    if (await this.prisma.ping()) {
      return this.getStatus(key, true);
    }
    throw new HealthCheckError('Database check failed', this.getStatus(key, false, { message: 'PostgreSQL is not reachable' }));
  }
}
