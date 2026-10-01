import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuid } from 'uuid';
import type { IncomingMessage, ServerResponse } from 'http';
import type { AppConfig } from '../config/env';
import { REDACT_PATHS, REDACTED, scrubUrlCredentials } from './redaction';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,128}$/;

export function resolveRequestId(req: IncomingMessage, res?: ServerResponse): string {
  const inbound = req.headers['x-request-id'];
  const id = typeof inbound === 'string' && REQUEST_ID_PATTERN.test(inbound) ? inbound : uuid();
  res?.setHeader('x-request-id', id);
  return id;
}

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const nodeEnv = config.get('NODE_ENV', { infer: true });
        const level =
          config.get('LOG_LEVEL', { infer: true }) ?? (nodeEnv === 'production' ? 'info' : 'debug');

        return {
          pinoHttp: {
            level,
            genReqId: resolveRequestId,
            redact: { paths: REDACT_PATHS, censor: REDACTED },
            formatters: {
              level: (label: string) => ({ level: label }),
            },
            base: { env: nodeEnv },
            serializers: {
              req: (req: { id: string; method: string; url: string }) => ({
                id: req.id,
                method: req.method,
                url: scrubUrlCredentials(req.url),
              }),
              res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
              err: (err: Error) => ({
                type: err.name,
                message: scrubUrlCredentials(err.message),
                stack: nodeEnv === 'production' ? undefined : err.stack,
              }),
            },
            customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
              if (err || res.statusCode >= 500) return 'error';
              if (res.statusCode >= 400) return 'warn';
              return 'info';
            },
            customSuccessMessage: (req: IncomingMessage, res: ServerResponse) =>
              `${req.method} ${req.url} ${res.statusCode}`,
            autoLogging: {
              ignore: (req: IncomingMessage) => {
                const url = req.url ?? '';
                return url === '/health' || url === '/health/ready';
              },
            },
            ...(nodeEnv === 'development' && {
              transport: {
                target: 'pino-pretty',
                options: { colorize: true, singleLine: true },
              },
            }),
          },
        };
      },
    }),
  ],
})
export class AppLoggingModule {}
