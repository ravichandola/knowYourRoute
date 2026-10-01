import { Controller, Post } from '@nestjs/common';
import {
  authContract,
  type AuthResponse,
  type LoginInput,
  type SignupInput,
} from '@know-your-route/contracts';
import { ContractBody } from '../../../platform/http';
import { AuthService } from '../application/auth.service';
import { Public } from './decorators/public.decorator';

@Public()
@Controller(authContract.basePath)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return this.authService.demoLogin();
  }
}
