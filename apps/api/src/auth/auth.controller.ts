import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginInput, SignupInput } from '@know-your-route/validation';
import { AuthResponse } from '@know-your-route/types';
import { Public } from './decorators/public.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginInput): Promise<AuthResponse> {
    return this.authService.login(body);
  }

  @Post('signup')
  async signup(@Body() body: SignupInput): Promise<AuthResponse> {
    return this.authService.signup(body);
  }

  @Post('demo-login')
  async demoLogin(): Promise<AuthResponse> {
    return this.authService.demoLogin();
  }
}
