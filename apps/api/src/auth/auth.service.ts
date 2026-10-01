import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthResponse, User } from '@know-your-route/types';
import { LoginInput, SignupInput } from '@know-your-route/validation';
import { PrismaService } from '../common/prisma.service';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER_ID } from './auth.constants';

interface StoredCredential {
  user: User;
  passwordHash: string;
}

@Injectable()
export class AuthService {
  private readonly fallbackUsers = new Map<string, StoredCredential>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    const demoUser: User = {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      name: 'Alex Rivera',
      phone: '+91 98765 43210',
      isOnboarded: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.fallbackUsers.set(DEMO_EMAIL, {
      user: demoUser,
      passwordHash: bcrypt.hashSync(DEMO_PASSWORD, 10),
    });
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    if (!input.password) {
      throw new UnauthorizedException('Password is required');
    }

    const email = input.email.toLowerCase().trim();
    const dbUser = await this.findDbUserByEmail(email);

    if (dbUser) {
      if (!dbUser.passwordHash || !(await bcrypt.compare(input.password, dbUser.passwordHash))) {
        throw new UnauthorizedException('Invalid email or password');
      }
      return this.issueToken(this.toUser(dbUser));
    }

    const stored = this.fallbackUsers.get(email);
    if (!stored || !(await bcrypt.compare(input.password, stored.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueToken(stored.user);
  }

  async signup(input: SignupInput): Promise<AuthResponse> {
    const email = input.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(input.password, 10);

    if (this.fallbackUsers.has(email) || (await this.findDbUserByEmail(email))) {
      throw new ConflictException('An account with this email already exists');
    }

    try {
      const created = await this.prisma.user.create({
        data: {
          email,
          name: input.name,
          phone: input.phone,
          passwordHash,
          isOnboarded: false,
        },
      });
      return this.issueToken(this.toUser(created));
    } catch {
      const user: User = {
        id: `usr_${Date.now()}`,
        email,
        name: input.name,
        phone: input.phone,
        isOnboarded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.fallbackUsers.set(email, { user, passwordHash });
      return this.issueToken(user);
    }
  }

  async demoLogin(): Promise<AuthResponse> {
    const stored = this.fallbackUsers.get(DEMO_EMAIL);
    if (!stored) {
      throw new UnauthorizedException('Demo account is unavailable');
    }
    return this.issueToken(stored.user);
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; email: string }>(token);
      const user = await this.getUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid or expired authentication token');
      }
      return user;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    for (const stored of this.fallbackUsers.values()) {
      if (stored.user.id === userId) {
        return stored.user;
      }
    }

    const dbUser = await this.findDbUserById(userId);
    return dbUser ? this.toUser(dbUser) : null;
  }

  async markOnboarded(userId: string): Promise<User> {
    for (const [email, stored] of this.fallbackUsers.entries()) {
      if (stored.user.id === userId) {
        const updated: User = {
          ...stored.user,
          isOnboarded: true,
          updatedAt: new Date().toISOString(),
        };
        this.fallbackUsers.set(email, { ...stored, user: updated });
        return updated;
      }
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: { isOnboarded: true },
      });
      return this.toUser(updated);
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  private issueToken(user: User): AuthResponse {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: this.toExpirySeconds(expiresIn) }
    );
    return {
      user,
      token,
      expiresIn: this.toExpirySeconds(expiresIn),
    };
  }

  private toExpirySeconds(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
      return 604800;
    }
    const value = Number(match[1]);
    const unit = match[2];
    if (unit === 's') return value;
    if (unit === 'm') return value * 60;
    if (unit === 'h') return value * 3600;
    return value * 86400;
  }

  private async findDbUserByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch {
      return null;
    }
  }

  private async findDbUserById(id: string) {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
    } catch {
      return null;
    }
  }

  private toUser(dbUser: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    avatarUrl?: string | null;
    isOnboarded: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone || undefined,
      avatarUrl: dbUser.avatarUrl || undefined,
      isOnboarded: dbUser.isOnboarded,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    };
  }
}
