const SENSITIVE_KEYS = [
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'passwordHash',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'clientSecret',
  'databaseUrl',
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'STORAGE_ACCESS_KEY',
  'STORAGE_SECRET_KEY',
  'GOOGLE_MAPS_API_KEY',
  'OPENWEATHER_API_KEY',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'oemCredentials',
  'fastagCredentials',
];

/**
 * Pino redact paths. Every sensitive key is covered at the top level, one level deep and inside
 * request/response headers/bodies, so a developer logging `{ user, password }` or `{ req }` cannot leak it.
 */
export const REDACT_PATHS: string[] = SENSITIVE_KEYS.flatMap((key) => {
  const accessor = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : `["${key}"]`;
  const nested = accessor.startsWith('[') ? accessor : `.${accessor}`;
  return [
    accessor,
    `*${nested}`,
    `*.*${nested}`,
    `req.headers${nested}`,
    `res.headers${nested}`,
    `req.body${nested}`,
  ];
});

export const REDACTED = '[REDACTED]';

const URL_CREDENTIALS = /([a-z][a-z0-9+.-]*:\/\/)([^/\s:@]+):([^/\s@]+)@/gi;

/** Removes `user:password@` from any connection-string-looking text. */
export function scrubUrlCredentials(text: string): string {
  return text.replace(URL_CREDENTIALS, `$1$2:${REDACTED}@`);
}
