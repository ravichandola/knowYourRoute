import type { TripPreference } from '@know-your-route/contracts';

export const PREFERENCE_REPOSITORY = 'PREFERENCE_REPOSITORY';

export interface PreferenceRepository {
  find(userId: string): Promise<TripPreference | null>;
  save(userId: string, preferences: TripPreference): Promise<TripPreference>;
}

export const DEFAULT_TRIP_PREFERENCES: TripPreference = {
  preferredStopsIntervalKm: 150,
  avoidTolls: false,
  avoidHighways: false,
  maxDrivingHoursPerDay: 8,
  drivingStyle: 'BALANCED',
};
