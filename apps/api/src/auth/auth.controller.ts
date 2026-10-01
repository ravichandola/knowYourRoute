import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginInput, SignupInput } from '@know-your-route/validation';
import { AuthResponse, User } from '@know-your-route/types';

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

  @Get('me')
  async getCurrentUser(@Headers('authorization') authHeader?: string): Promise<User> {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    return this.authService.validateToken(token);
  }
}
