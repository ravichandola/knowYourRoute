import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEV_FALLBACK_SECRET = 'dev-only-insecure-jwt-secret';

/** A missing secret is tolerated in development only; production must fail at boot. */
export function resolveJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');
  if (secret) {
    return secret;
  }
  if (config.get<string>('NODE_ENV') === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  new Logger('IdentityModule').warn('JWT_SECRET is not set; using an insecure development secret');
  return DEV_FALLBACK_SECRET;
}
