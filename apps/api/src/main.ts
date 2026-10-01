import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import type { AppConfig } from './platform/config/env';
import { API_PREFIX, configureApp } from './platform/http/bootstrap';

/**
 * Startup order: env validation (ConfigModule) -> logger -> PrismaService.onModuleInit (DB) ->
 * CacheService.onModuleInit (Redis) -> StorageModule.onModuleInit (bucket) -> listen.
 * Any mandatory dependency failing aborts the process with exit code 1.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  configureApp(app);

  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });
  const host = config.get('HOST', { infer: true });
  const nodeEnv = config.get('NODE_ENV', { infer: true });

  await app.listen(port, host);

  const logger = await app.resolve(PinoLogger);
  logger.setContext('Bootstrap');
  logger.info({ port, host, nodeEnv, prefix: `/${API_PREFIX}` }, 'Know Your Route API started');
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fatal: API failed to start: ${message}`);
  process.exit(1);
});
