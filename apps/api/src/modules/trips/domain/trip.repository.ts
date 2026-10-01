import type { Trip } from '@know-your-route/contracts';

export const TRIP_REPOSITORY = 'TRIP_REPOSITORY';

export interface TripRepository {
  save(trip: Trip): Promise<Trip>;
  findById(id: string): Promise<Trip | null>;
  listByUser(userId: string): Promise<Trip[]>;
}
