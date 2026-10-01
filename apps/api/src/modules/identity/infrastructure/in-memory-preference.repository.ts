import { Injectable } from '@nestjs/common';
import type { TripPreference } from '@know-your-route/contracts';
import type { PreferenceRepository } from '../domain/preference.repository';

@Injectable()
export class InMemoryPreferenceRepository implements PreferenceRepository {
  private readonly store = new Map<string, TripPreference>();

  async find(userId: string): Promise<TripPreference | null> {
    return this.store.get(userId) ?? null;
  }

  async save(userId: string, preferences: TripPreference): Promise<TripPreference> {
    this.store.set(userId, preferences);
    return preferences;
  }
}
