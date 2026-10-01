import { Injectable } from '@nestjs/common';
import type { Trip } from '@know-your-route/contracts';
import type { TripRepository } from '../domain/trip.repository';

@Injectable()
export class InMemoryTripRepository implements TripRepository {
  private readonly trips = new Map<string, Trip>();

  async save(trip: Trip): Promise<Trip> {
    this.trips.set(trip.id, trip);
    return trip;
  }

  async findById(id: string): Promise<Trip | null> {
    return this.trips.get(id) ?? null;
  }

  async listByUser(userId: string): Promise<Trip[]> {
    return [...this.trips.values()].filter((trip) => trip.userId === userId);
  }
}
