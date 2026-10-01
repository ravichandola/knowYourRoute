import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../http/public.decorator';
import { PrismaHealthIndicator } from './prisma.health';
import { RedisHealthIndicator } from './redis.health';

const startedAt = Date.now();

@Public()
@SkipThrottle()
@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
  ) {}

  /** Liveness: the process is up. No dependency checks, so an outage never restarts a healthy process. */
  @Get('health')
  liveness() {
    return { status: 'ok', uptimeSeconds: Math.round((Date.now() - startedAt) / 1000) };
  }

  /** Readiness: critical dependencies (PostgreSQL, Redis) are reachable. Third-party providers are not checked. */
  @Get('health/ready')
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.isHealthy('database'),
      () => this.redisHealth.isHealthy('redis'),
    ]);
  }
}
