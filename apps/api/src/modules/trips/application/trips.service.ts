import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateTripInput, Trip, TripExplanation } from '@know-your-route/contracts';
import { buildTripContext } from '../domain/trip-context';
import { DEFAULT_TRIP_ESTIMATE } from '../domain/trip-estimate';
import { TRIP_EXPLAINER, TripExplainer } from '../domain/trip-explainer.port';
import { TRIP_REPOSITORY, TripRepository } from '../domain/trip.repository';
import { TRIP_VEHICLE_LOOKUP, TripVehicleLookup } from '../domain/vehicle-lookup.port';

@Injectable()
export class TripsService {
  constructor(
    @Inject(TRIP_REPOSITORY) private readonly trips: TripRepository,
    @Inject(TRIP_VEHICLE_LOOKUP) private readonly vehicles: TripVehicleLookup,
    @Inject(TRIP_EXPLAINER) private readonly explainer: TripExplainer
  ) {}

  async createTrip(userId: string, input: CreateTripInput): Promise<Trip> {
    const vehicle = await this.vehicles.getVehicle(input.vehicleId, userId);
    const now = new Date().toISOString();

    return this.trips.save({
      id: `trip_${Date.now()}`,
      userId,
      vehicleId: input.vehicleId,
      vehicle,
      origin: input.origin,
      destination: input.destination,
      selectedRouteId: input.selectedRouteId,
      status: 'PLANNED',
      totalDistanceKm: DEFAULT_TRIP_ESTIMATE.totalDistanceKm,
      totalDurationMinutes: DEFAULT_TRIP_ESTIMATE.totalDurationMinutes,
      estimatedCost: DEFAULT_TRIP_ESTIMATE.cost,
      createdAt: now,
      updatedAt: now,
    });
  }

  async getTrip(tripId: string, userId?: string): Promise<Trip> {
    const trip = await this.trips.findById(tripId);
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }
    if (userId && trip.userId !== userId) {
      throw new ForbiddenException('You do not have access to this trip');
    }
    return trip;
  }

  listUserTrips(userId: string): Promise<Trip[]> {
    return this.trips.listByUser(userId);
  }

  async getTripExplanation(tripId: string, userId?: string): Promise<TripExplanation> {
    const trip = await this.getTrip(tripId, userId);
    const vehicle = trip.vehicle ?? (await this.vehicles.getVehicle(trip.vehicleId));
    return this.explainer.explain(buildTripContext(trip, vehicle));
  }
}
