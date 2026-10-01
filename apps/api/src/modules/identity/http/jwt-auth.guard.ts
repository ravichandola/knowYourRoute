import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { User } from '@know-your-route/contracts';
import { AuthenticationError } from '../../../platform/errors';
import { AuthService } from '../application/auth.service';
import { IS_PUBLIC_KEY } from '../../../platform/http/public.decorator';

/** Normalized identity established once per request; controllers never decode tokens themselves. */
export interface AuthContext {
  userId: string;
  email: string;
}

interface AuthenticatedRequest {
  headers: { authorization?: string };
  user?: User;
  auth?: AuthContext;
  log?: { setBindings(bindings: Record<string, unknown>): void };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    if (!header || !/^Bearer\s+/i.test(header)) {
      throw new AuthenticationError('Authorization header is missing');
    }

    const token = header.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      throw new AuthenticationError('Authorization header is missing');
    }

    const user = await this.authService.validateToken(token);
    request.user = user;
    request.auth = { userId: user.id, email: user.email };
    request.log?.setBindings({ userId: user.id });
    return true;
  }
}
