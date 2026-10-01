import {
  ArgumentsHost,
  ForbiddenException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ZodError, z } from 'zod';
import { AuthenticationError, DatabaseError, ValidationError } from '../errors';
import { HttpExceptionFilter } from './http-exception.filter';

function createHost(request: Record<string, unknown> = {}) {
  const response = {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const req = { method: 'POST', url: '/api/v1/test', headers: { 'x-request-id': 'req-from-header' }, ...request };
  const host = {
    switchToHttp: () => ({ getResponse: () => response, getRequest: () => req }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

const bodyOf = (response: ReturnType<typeof createHost>['response']) =>
  response.json.mock.calls[0][0] as { success: boolean; error: Record<string, unknown> };

describe('HttpExceptionFilter', () => {
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });
  afterAll(() => jest.restoreAllMocks());

  it('maps AppError to the standard envelope', () => {
    const { host, response } = createHost();
    new HttpExceptionFilter().catch(new AuthenticationError('Bad token'), host);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(bodyOf(response)).toEqual({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'Bad token', requestId: 'req-from-header' },
    });
    expect(response.setHeader).toHaveBeenCalledWith('x-request-id', 'req-from-header');
  });

  it('maps database connectivity failures to a retryable 503, not an auth or generic error', () => {
    const initFailure = Object.assign(new Error("Can't reach database server"), {
      name: 'PrismaClientInitializationError',
      errorCode: 'P1001',
    });
    const { host, response } = createHost();
    new HttpExceptionFilter().catch(initFailure, host);

    expect(response.status).toHaveBeenCalledWith(503);
    expect(bodyOf(response).error.code).toBe('DATABASE_ERROR');
  });

  it('keeps the status of body-parser client errors', () => {
    const tooLarge = Object.assign(new Error('request entity too large'), { status: 413, type: 'entity.too.large' });
    const { host, response } = createHost();
    new HttpExceptionFilter().catch(tooLarge, host);

    expect(response.status).toHaveBeenCalledWith(413);
    expect(bodyOf(response).error).toMatchObject({ code: 'VALIDATION_ERROR', message: 'Request body is too large' });
  });

  it('prefers the request id assigned by the logger middleware', () => {
    const { host, response } = createHost({ id: 'pino-assigned-id' });
    new HttpExceptionFilter().catch(new Error('boom'), host);
    expect(bodyOf(response).error.requestId).toBe('pino-assigned-id');
  });

  it('maps Nest HttpExceptions to error classes', () => {
    const notFound = createHost();
    new HttpExceptionFilter().catch(new NotFoundException('nope'), notFound.host);
    expect(notFound.response.status).toHaveBeenCalledWith(404);
    expect(bodyOf(notFound.response).error.code).toBe('NOT_FOUND');

    const forbidden = createHost();
    new HttpExceptionFilter().catch(new ForbiddenException(), forbidden.host);
    expect(bodyOf(forbidden.response).error.code).toBe('AUTHORIZATION_ERROR');
  });

  it('maps ZodError and ValidationError with field details', () => {
    const parsed = z.object({ email: z.string().email() }).safeParse({ email: 'x' });
    const { host, response } = createHost();
    new HttpExceptionFilter().catch(parsed.success ? new ZodError([]) : parsed.error, host);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(bodyOf(response).error.details).toEqual([{ path: 'email', message: 'Invalid email' }]);

    const second = createHost();
    new HttpExceptionFilter().catch(new ValidationError('Bad', [{ path: 'a', message: 'b' }]), second.host);
    expect(bodyOf(second.response).error.details).toEqual([{ path: 'a', message: 'b' }]);
  });

  it('maps Prisma known errors', () => {
    const conflict = createHost();
    new HttpExceptionFilter().catch(Object.assign(new Error('unique'), { code: 'P2002' }), conflict.host);
    expect(conflict.response.status).toHaveBeenCalledWith(409);

    const missing = createHost();
    new HttpExceptionFilter().catch(Object.assign(new Error('missing'), { code: 'P2025' }), missing.host);
    expect(missing.response.status).toHaveBeenCalledWith(404);

    const other = createHost();
    new HttpExceptionFilter().catch(Object.assign(new Error('fk'), { code: 'P2003' }), other.host);
    expect(other.response.status).toHaveBeenCalledWith(500);
    expect(bodyOf(other.response).error.code).toBe('DATABASE_ERROR');
  });

  it('exposes internal error messages outside production', () => {
    const { host, response } = createHost();
    new HttpExceptionFilter(false).catch(new Error('connect ECONNREFUSED 10.0.0.5:5432'), host);
    expect(bodyOf(response).error.message).toContain('ECONNREFUSED');
  });

  it('sanitizes 5xx errors in production and never leaks internals', () => {
    const { host, response } = createHost();
    new HttpExceptionFilter(true).catch(
      new DatabaseError('postgresql://user:secret@db:5432/app failed', { stack: '/srv/app/src/x.ts' }),
      host,
    );

    const body = bodyOf(response);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(body.error.message).toBe('Something went wrong');
    expect(body.error.details).toBeUndefined();
    expect(JSON.stringify(body)).not.toMatch(/secret|postgresql|\/srv\/app|stack/);
  });

  it('keeps client-facing messages for 4xx errors in production', () => {
    const { host, response } = createHost();
    new HttpExceptionFilter(true).catch(new ValidationError('Invalid email'), host);
    expect(bodyOf(response).error.message).toBe('Invalid email');
  });

  it('preserves the terminus readiness report on 503', () => {
    const report = { status: 'error', info: {}, error: { redis: { status: 'down' } }, details: { redis: { status: 'down' } } };
    const { host, response } = createHost();
    new HttpExceptionFilter(true).catch(new ServiceUnavailableException(report), host);

    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.json).toHaveBeenCalledWith(report);
  });
});
