import pino from 'pino';
import { Writable } from 'node:stream';
import { REDACT_PATHS, REDACTED, scrubUrlCredentials } from './redaction';

function capture() {
  const lines: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      lines.push(JSON.parse(chunk.toString()));
      callback();
    },
  });
  const logger = pino({ redact: { paths: REDACT_PATHS, censor: REDACTED } }, stream);
  return { logger, lines };
}

describe('log redaction', () => {
  it('redacts credentials at top level, nested and inside request headers/body', () => {
    const { logger, lines } = capture();

    logger.info(
      {
        password: 'p1',
        token: 't1',
        user: { passwordHash: 'h1', email: 'a@b.c' },
        deep: { inner: { refreshToken: 'r1' } },
        req: {
          headers: { authorization: 'Bearer abc', cookie: 'sid=1', 'x-request-id': 'keep-me' },
          body: { password: 'p2', name: 'Asha' },
        },
        STORAGE_SECRET_KEY: 's3',
        DATABASE_URL: 'postgresql://u:pw@h/db',
        fastagCredentials: { pin: '1234' },
      },
      'login',
    );

    const serialized = JSON.stringify(lines[0]);
    for (const secret of ['p1', 't1', 'h1', 'r1', 'Bearer abc', 'sid=1', 'p2', 's3', 'u:pw', '1234']) {
      expect(serialized).not.toContain(secret);
    }
    expect(lines[0]).toMatchObject({
      user: { email: 'a@b.c' },
      req: { headers: { 'x-request-id': 'keep-me' }, body: { name: 'Asha' } },
    });
    expect(serialized).toContain(REDACTED);
  });

  it('scrubs credentials embedded in connection strings', () => {
    expect(scrubUrlCredentials('connect postgresql://app:hunter2@db:5432/app failed')).toBe(
      `connect postgresql://app:${REDACTED}@db:5432/app failed`,
    );
    expect(scrubUrlCredentials('redis://:pw@cache:6379')).toContain('redis://');
    expect(scrubUrlCredentials('no credentials here')).toBe('no credentials here');
  });
});
