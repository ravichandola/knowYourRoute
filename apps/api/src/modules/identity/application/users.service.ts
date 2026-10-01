import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { TripPreference, User } from '@know-your-route/contracts';
import {
  DEFAULT_TRIP_PREFERENCES,
  PREFERENCE_REPOSITORY,
  PreferenceRepository,
} from '../domain/preference.repository';
import { USER_REPOSITORY, UserRepository } from '../domain/user.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PREFERENCE_REPOSITORY) private readonly preferences: PreferenceRepository
  ) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async markOnboarded(userId: string): Promise<User> {
    const user = await this.users.markOnboarded(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getPreferences(userId: string): Promise<TripPreference> {
    return (await this.preferences.find(userId)) ?? DEFAULT_TRIP_PREFERENCES;
  }

  async updatePreferences(userId: string, prefs: TripPreference): Promise<TripPreference> {
    return this.preferences.save(userId, prefs);
  }
}
