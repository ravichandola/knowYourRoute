/// <reference types="jest" />

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER_ID } from './auth.constants';

describe('AuthService', () => {
  let authService: AuthService;
  const issuedTokens = new Map<string, { sub: string; email: string }>();

  beforeEach(() => {
    issuedTokens.clear();
    const jwtService = {
      sign: (payload: { sub: string; email: string }) => {
        const token = `test-token-${payload.sub}-${Date.now()}`;
        issuedTokens.set(token, payload);
        return token;
      },
      verifyAsync: async (token: string) => {
        const payload = issuedTokens.get(token);
        if (!payload) {
          throw new Error('invalid token');
        }
        return payload;
      },
    } as any;
    const config = {
      get: (key: string) => (key === 'JWT_EXPIRES_IN' ? '7d' : 'test-secret'),
    } as ConfigService;
    const prisma = {
      user: {
        findUnique: jest.fn().mockRejectedValue(new Error('db offline')),
        create: jest.fn().mockRejectedValue(new Error('db offline')),
        update: jest.fn().mockRejectedValue(new Error('db offline')),
      },
    } as any;

    authService = new AuthService(prisma, jwtService, config);
  });

  it('issues a verifiable JWT for demo login', async () => {
    const result = await authService.demoLogin();
    expect(result.user.id).toBe(DEMO_USER_ID);
    expect(result.token).toBeTruthy();

    const user = await authService.validateToken(result.token);
    expect(user.email).toBe(DEMO_EMAIL);
  });

  it('authenticates the demo user with a password', async () => {
    const result = await authService.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    expect(result.user.id).toBe(DEMO_USER_ID);
  });

  it('rejects invalid credentials', async () => {
    await expect(
      authService.login({ email: DEMO_EMAIL, password: 'wrong-password' })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects malformed tokens instead of falling back to the demo user', async () => {
    await expect(authService.validateToken('jwt_token_usr_other_1')).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });
});
