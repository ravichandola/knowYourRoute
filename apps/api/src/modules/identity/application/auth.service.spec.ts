/// <reference types="jest" />

import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { InMemoryUserRepository } from '../infrastructure/in-memory-user.repository';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER_ID } from '../../../platform/demo/demo-data';

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
    authService = new AuthService(new InMemoryUserRepository(), jwtService, config);
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

  it('creates a new account and rejects a duplicate email', async () => {
    const signup = { name: 'Asha', email: 'Asha@Example.com ', password: 'secret123' };
    const created = await authService.signup(signup);
    expect(created.user.email).toBe('asha@example.com');
    expect(created.user.isOnboarded).toBe(false);

    await expect(authService.signup(signup)).rejects.toBeInstanceOf(ConflictException);
    await expect(
      authService.login({ email: 'asha@example.com', password: 'secret123' })
    ).resolves.toEqual(expect.objectContaining({ token: expect.any(String) }));
  });
});
