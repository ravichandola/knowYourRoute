import { Injectable, NotFoundException } from '@nestjs/common';
import { User, TripPreference } from '@know-your-route/types';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  private inMemoryPreferences = new Map<string, TripPreference>();

  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<User> {
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
      // Fallback
    }

    return {
      id: userId,
      email: 'demo@knowyourroute.com',
      name: 'Alex Rivera',
      phone: '+91 98765 43210',
      isOnboarded: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async markOnboarded(userId: string): Promise<User> {
    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: { isOnboarded: true },
      });
      return {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone || undefined,
        isOnboarded: updated.isOnboarded,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch {
      return {
        id: userId,
        email: 'demo@knowyourroute.com',
        name: 'Alex Rivera',
        isOnboarded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
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
