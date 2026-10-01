import { Injectable, NotFoundException } from '@nestjs/common';
import { User, TripPreference } from '@know-your-route/types';
import { PrismaService } from '../common/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  private inMemoryPreferences = new Map<string, TripPreference>();

  constructor(
    private prisma: PrismaService,
    private authService: AuthService
  ) {}

  async getProfile(userId: string): Promise<User> {
    const fromAuth = await this.authService.getUserById(userId);
    if (fromAuth) {
      return fromAuth;
    }

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone || undefined,
          isOnboarded: user.isOnboarded,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      }
    } catch {
      // DB unavailable
    }

    throw new NotFoundException('User not found');
  }

  async markOnboarded(userId: string): Promise<User> {
    return this.authService.markOnboarded(userId);
  }

  async getPreferences(userId: string): Promise<TripPreference> {
    return (
      this.inMemoryPreferences.get(userId) || {
        preferredStopsIntervalKm: 150,
        avoidTolls: false,
        avoidHighways: false,
        maxDrivingHoursPerDay: 8,
        drivingStyle: 'BALANCED',
      }
    );
  }

  async updatePreferences(userId: string, prefs: TripPreference): Promise<TripPreference> {
    this.inMemoryPreferences.set(userId, prefs);
    return prefs;
  }
}
