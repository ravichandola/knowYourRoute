import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { User } from '@know-your-route/contracts';
import { AuthService } from '../application/auth.service';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: User }>();
    const header = request.headers.authorization;
    if (!header || !/^Bearer\s+/i.test(header)) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = header.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    request.user = await this.authService.validateToken(token);
    return true;
  }
}
