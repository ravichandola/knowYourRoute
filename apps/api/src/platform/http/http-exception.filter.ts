import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DatabaseError,
  ErrorCode,
  InternalServerError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from '../errors';

function isHealthReport(body: unknown): body is { status: string } {
  return (
    typeof body === 'object' &&
    body !== null &&
    'status' in body &&
    'info' in body &&
    'details' in body
  );
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly isProduction: boolean = false) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const headerId = request.headers['x-request-id'];
    const requestId = request.id
      ? String(request.id)
      : typeof headerId === 'string' && headerId
        ? headerId
        : `req_${Date.now()}`;

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (exception.getStatus() === HttpStatus.SERVICE_UNAVAILABLE && isHealthReport(body)) {
        response.setHeader('x-request-id', requestId);
        response.status(HttpStatus.SERVICE_UNAVAILABLE).json(body);
        return;
      }
    }

    const appError = this.toAppError(exception);
    const hideDetails = this.isProduction && (!appError.isOperational || appError.httpStatus >= 500);

    const logPayload = {
      requestId,
      method: request.method,
      url: request.url,
      statusCode: appError.httpStatus,
      errorCode: appError.code,
      err: exception instanceof Error ? exception : undefined,
    };
    if (appError.httpStatus >= 500) {
      this.logger.error(logPayload, `${appError.code}: ${appError.message}`);
    } else {
      this.logger.warn(logPayload, `${appError.code}: ${appError.message}`);
    }

    response.setHeader('x-request-id', requestId);
    response.status(appError.httpStatus).json({
      success: false,
      error: {
        code: appError.code,
        message: hideDetails ? 'Something went wrong' : appError.message,
        requestId,
        ...(appError.details !== undefined && !hideDetails ? { details: appError.details } : {}),
      },
    });
  }

  private toAppError(exception: unknown): AppError {
    if (exception instanceof AppError) {
      return exception;
    }

    if (exception instanceof ZodError) {
      return new ValidationError(
        'Validation failed',
        exception.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      );
    }

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (this.isDatabaseUnavailable(exception)) {
      return new AppError(ErrorCode.DATABASE_ERROR, 'Service temporarily unavailable', 503, false);
    }

    if (this.isPrismaError(exception)) {
      return this.fromPrismaError(exception as { code: string; meta?: Record<string, unknown> });
    }

    const bodyParserError = this.fromBodyParserError(exception);
    if (bodyParserError) {
      return bodyParserError;
    }

    if (exception instanceof Error) {
      return new InternalServerError(exception.message);
    }

    return new InternalServerError('An unexpected error occurred');
  }

  private fromHttpException(ex: HttpException): AppError {
    const status = ex.getStatus();
    const body = ex.getResponse();
    const record = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
    const rawMessage = typeof body === 'string' ? body : record.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join('; ')
      : typeof rawMessage === 'string'
        ? rawMessage
        : ex.message;
    const details = record.details;

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return new ValidationError(message, details);
      case HttpStatus.UNAUTHORIZED:
        return new AuthenticationError(message);
      case HttpStatus.FORBIDDEN:
        return new AuthorizationError(message);
      case HttpStatus.NOT_FOUND:
        return new NotFoundError(message);
      case HttpStatus.CONFLICT:
        return new ConflictError(message);
      case HttpStatus.TOO_MANY_REQUESTS:
        return new RateLimitError();
      default:
        return status >= 500
          ? new InternalServerError(message, details)
          : new AppError(ErrorCode.VALIDATION_ERROR, message, status, true, details);
    }
  }

  /** body-parser raises `http-errors` (not Nest exceptions) for oversized or malformed bodies. */
  private fromBodyParserError(err: unknown): AppError | null {
    if (err === null || typeof err !== 'object') return null;
    const { status, type } = err as { status?: unknown; type?: unknown };
    if (typeof status !== 'number' || status < 400 || status >= 500 || typeof type !== 'string') {
      return null;
    }
    const message =
      type === 'entity.too.large'
        ? 'Request body is too large'
        : type === 'entity.parse.failed'
          ? 'Request body is not valid JSON'
          : 'Invalid request body';
    return new AppError(ErrorCode.VALIDATION_ERROR, message, status, true);
  }

  /** Connection-level Prisma failures (server unreachable, timeout, pool exhausted, closed connection). */
  private isDatabaseUnavailable(err: unknown): boolean {
    if (err === null || typeof err !== 'object') return false;
    const { name, code, errorCode } = err as { name?: unknown; code?: unknown; errorCode?: unknown };
    if (name === 'PrismaClientInitializationError') return true;
    const prismaCode = typeof errorCode === 'string' ? errorCode : code;
    return typeof prismaCode === 'string' && ['P1001', 'P1002', 'P1008', 'P1017', 'P2024'].includes(prismaCode);
  }

  private isPrismaError(err: unknown): boolean {
    if (err === null || typeof err !== 'object' || !('code' in err)) return false;
    const code = (err as { code: unknown }).code;
    return typeof code === 'string' && /^P\d{4}$/.test(code);
  }

  private fromPrismaError(err: { code: string; meta?: Record<string, unknown> }): AppError {
    switch (err.code) {
      case 'P2002':
        return new ConflictError('A record with the same unique value already exists');
      case 'P2025':
        return new NotFoundError('Record not found');
      default:
        return new DatabaseError(`Database error (${err.code})`);
    }
  }
}
