import { ConfigService } from '@nestjs/config';
import { resolveJwtSecret } from './jwt-config';

const configWith = (values: Record<string, string>) =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService;

describe('resolveJwtSecret', () => {
  it('uses the configured secret', () => {
    expect(resolveJwtSecret(configWith({ JWT_SECRET: 's3cret' }))).toBe('s3cret');
  });

  it('refuses to start in production without a secret', () => {
    expect(() => resolveJwtSecret(configWith({ NODE_ENV: 'production' }))).toThrow(
      'JWT_SECRET must be set in production'
    );
  });

  it('falls back to an obviously insecure secret in development', () => {
    expect(resolveJwtSecret(configWith({}))).toContain('insecure');
  });
});
