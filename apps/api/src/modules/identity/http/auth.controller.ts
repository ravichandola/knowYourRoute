import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import {
  authContract,
  type AuthResponse,
  type LoginInput,
  type SignupInput,
} from '@know-your-route/contracts';
import { ContractBody } from '../../../platform/http';
import { NotFoundError } from '../../../platform/errors';
import { AuthService } from '../application/auth.service';
import { Public } from '../../../platform/http/public.decorator';

const AUTH_RATE_LIMIT = { default: { limit: 10, ttl: 60_000 } };

@Public()
@Throttle(AUTH_RATE_LIMIT)
@Controller(authContract.basePath)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post(authContract.login.path)
  login(@ContractBody(authContract.login) body: LoginInput): Promise<AuthResponse> {
    return this.authService.login(body);
  }

  @Post(authContract.signup.path)
  signup(@ContractBody(authContract.signup) body: SignupInput): Promise<AuthResponse> {
    return this.authService.signup(body);
  }

  @Post(authContract.demoLogin.path)
  demoLogin(): Promise<AuthResponse> {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new NotFoundError('Demo login is not available');
    }
    return this.authService.demoLogin();
  }
}
