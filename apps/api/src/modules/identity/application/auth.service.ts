import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import type { AuthResponse, LoginInput, SignupInput, User } from '@know-your-route/contracts';
import { DEMO_EMAIL } from '../../../platform/demo/demo-data';
import { toExpirySeconds } from '../domain/token-expiry';
import { USER_REPOSITORY, UserRepository } from '../domain/user.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(input: LoginInput): Promise<AuthResponse> {
    if (!input.password) {
      throw new UnauthorizedException('Password is required');
    }

    const record = await this.users.findByEmail(this.normalizeEmail(input.email));
    const passwordMatches =
      !!record?.passwordHash && (await bcrypt.compare(input.password, record.passwordHash));
    if (!record || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueToken(record.user);
  }

  async signup(input: SignupInput): Promise<AuthResponse> {
    const email = this.normalizeEmail(input.email);
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await this.users.create({
      email,
      name: input.name,
      phone: input.phone,
      passwordHash: await bcrypt.hash(input.password, 10),
    });
    return this.issueToken(user);
  }

  async demoLogin(): Promise<AuthResponse> {
    const record = await this.users.findByEmail(DEMO_EMAIL);
    if (!record) {
      throw new UnauthorizedException('Demo account is unavailable');
    }
    return this.issueToken(record.user);
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; email: string }>(token);
      const user = await this.users.findById(payload.sub);
      if (user) {
        return user;
      }
    } catch {
      // handled below with a single, non-revealing error
    }
    throw new UnauthorizedException('Invalid or expired authentication token');
  }

  private issueToken(user: User): AuthResponse {
    const expiresIn = toExpirySeconds(this.configService.get<string>('JWT_EXPIRES_IN') || '7d');
    const token = this.jwtService.sign({ sub: user.id, email: user.email }, { expiresIn });
    return { user, token, expiresIn };
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }
}
