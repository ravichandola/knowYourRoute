import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from '../application/auth.service';
import { DEMO_USER_ID } from '../../../platform/demo/demo-data';

describe('JwtAuthGuard', () => {
  const user = {
    id: DEMO_USER_ID,
    email: 'demo@knowyourroute.com',
    name: 'Alex Rivera',
    isOnboarded: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const createContext = (authorization?: string): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization },
        }),
      }),
    }) as ExecutionContext;

  it('allows public routes without a token', async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(true) } as unknown as Reflector;
    const authService = { validateToken: jest.fn() } as unknown as AuthService;
    const guard = new JwtAuthGuard(reflector, authService);

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(authService.validateToken).not.toHaveBeenCalled();
  });

  it('rejects missing bearer tokens on protected routes', async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
    const authService = { validateToken: jest.fn() } as unknown as AuthService;
    const guard = new JwtAuthGuard(reflector, authService);

    await expect(guard.canActivate(createContext())).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches the authenticated user from a valid token', async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
    const authService = {
      validateToken: jest.fn().mockResolvedValue(user),
    } as unknown as AuthService;
    const guard = new JwtAuthGuard(reflector, authService);
    const request = { headers: { authorization: 'Bearer valid.token' } };
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request).toEqual(expect.objectContaining({ user }));
  });
});
