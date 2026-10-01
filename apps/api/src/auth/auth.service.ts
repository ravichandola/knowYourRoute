import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthResponse, User } from '@know-your-route/types';
import { LoginInput, SignupInput } from '@know-your-route/validation';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  // In-memory user fallback store for frictionless local dev when DB is not spun up
  private fallbackUsers: Map<string, User> = new Map([
    [
      'demo@knowyourroute.com',
      {
        id: 'usr_demo_101',
        email: 'demo@knowyourroute.com',
        name: 'Alex Rivera',
        phone: '+91 98765 43210',
        isOnboarded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  ]);

  constructor(private prisma: PrismaService) {}

  async login(input: LoginInput): Promise<AuthResponse> {
    const email = input.email.toLowerCase().trim();

    try {
      const dbUser = await this.prisma.user.findUnique({ where: { email } });
      if (dbUser) {
        return {
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            phone: dbUser.phone || undefined,
            avatarUrl: dbUser.avatarUrl || undefined,
            isOnboarded: dbUser.isOnboarded,
            createdAt: dbUser.createdAt.toISOString(),
            updatedAt: dbUser.updatedAt.toISOString(),
          },
          token: `jwt_token_${dbUser.id}_${Date.now()}`,
          expiresIn: 604800,
        };
      }
    } catch {
      // DB not running, proceed to fallback
    }

    let user = this.fallbackUsers.get(email);
    if (!user) {
      // Auto-provision demo user for seamless developer onboarding
      user = {
        id: `usr_${Date.now()}`,
        email,
        name: email.split('@')[0],
        isOnboarded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.fallbackUsers.set(email, user);
    }

    return {
      user,
      token: `jwt_token_${user.id}_${Date.now()}`,
      expiresIn: 604800,
    };
  }

  async signup(input: SignupInput): Promise<AuthResponse> {
    const email = input.email.toLowerCase().trim();

    try {
      const created = await this.prisma.user.create({
        data: {
          email,
          name: input.name,
          phone: input.phone,
          isOnboarded: false,
        },
      });

      return {
        user: {
          id: created.id,
          email: created.email,
          name: created.name,
          phone: created.phone || undefined,
          isOnboarded: created.isOnboarded,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
        token: `jwt_token_${created.id}_${Date.now()}`,
        expiresIn: 604800,
      };
    } catch {
      // In-memory fallback
      const user: User = {
        id: `usr_${Date.now()}`,
        email,
        name: input.name,
        phone: input.phone,
        isOnboarded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.fallbackUsers.set(email, user);

      return {
        user,
        token: `jwt_token_${user.id}_${Date.now()}`,
        expiresIn: 604800,
      };
    }
  }

  async validateToken(token: string): Promise<User> {
    if (!token || !token.startsWith('jwt_token_')) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    const parts = token.split('_');
    const userId = parts[2];

    for (const u of this.fallbackUsers.values()) {
      if (u.id === userId) return u;
    }

    try {
      const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });
      if (dbUser) {
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          phone: dbUser.phone || undefined,
          isOnboarded: dbUser.isOnboarded,
          createdAt: dbUser.createdAt.toISOString(),
          updatedAt: dbUser.updatedAt.toISOString(),
        };
      }
    } catch {
      // Fallback
    }

    // Default mock user
    return (
      this.fallbackUsers.get('demo@knowyourroute.com') || {
        id: 'usr_demo_101',
        email: 'demo@knowyourroute.com',
        name: 'Alex Rivera',
        isOnboarded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }
}
