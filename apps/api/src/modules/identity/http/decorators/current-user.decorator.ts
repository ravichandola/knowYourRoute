import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '@know-your-route/contracts';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
  return ctx.switchToHttp().getRequest<{ user: User }>().user;
});
