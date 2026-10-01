import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import type { AppConfig } from '../config/env';
import { HttpExceptionFilter } from './http-exception.filter';

export const API_PREFIX = 'api/v1';
export const HEALTH_ROUTES = ['health', 'health/ready'];

const DEV_ORIGINS = [/^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/127\.0\.0\.1(:\d+)?$/, /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/];

/**
 * Applies every cross-cutting HTTP concern in one place so `main.ts` and the e2e tests run the exact
 * same pipeline. Create the app with `{ bodyParser: false, bufferLogs: true }`.
 */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const nodeEnv = config.get('NODE_ENV', { infer: true });
  const corsOrigins = config.get('CORS_ORIGINS', { infer: true });
  const bodyLimit = config.get('BODY_LIMIT', { infer: true });
  const swaggerEnabled = nodeEnv === 'development' || config.get('ENABLE_SWAGGER', { infer: true });

  app.useLogger(app.get(PinoLogger));

  app.use(helmet());
  app.useBodyParser('json', { limit: bodyLimit });
  app.useBodyParser('urlencoded', { limit: bodyLimit, extended: true });

  app.enableCors({
    origin: corsOrigins ? corsOrigins.split(',').map((origin) => origin.trim()) : nodeEnv === 'production' ? false : DEV_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    exposedHeaders: ['x-request-id'],
  });

  app.setGlobalPrefix(API_PREFIX, { exclude: HEALTH_ROUTES });
  app.useGlobalFilters(new HttpExceptionFilter(nodeEnv === 'production'));
  app.enableShutdownHooks();

  if (swaggerEnabled && nodeEnv !== 'test') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Know Your Route API')
        .setDescription('Route Intelligence, Vehicle Intelligence, and Trip Safety Engine API')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document);
  }
}
