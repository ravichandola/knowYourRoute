import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  Trip,
  TripContext,
  TripCostBreakdown,
  TripExplanation,
} from '@know-your-route/types';
import { CreateTripInput } from '@know-your-route/validation';
import { AIService } from '../ai/ai.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class TripsService {
  private fallbackTrips: Map<string, Trip> = new Map();

  constructor(
    private aiService: AIService,
    private vehiclesService: VehiclesService,
    private prisma: PrismaService
  ) {}

  async createTrip(userId: string, input: CreateTripInput): Promise<Trip> {
    const vehicle = await this.vehiclesService.getVehicle(input.vehicleId, userId);

    const tripId = `trip_${Date.now()}`;
    const cost: TripCostBreakdown = {
      fuelCost: 1150,
      tollCost: 320,
      otherCharges: 0,
      totalCost: 1470,
      currency: 'INR',
    };

    const trip: Trip = {
      id: tripId,
      userId,
      vehicleId: input.vehicleId,
      vehicle,
      origin: input.origin,
      destination: input.destination,
      selectedRouteId: input.selectedRouteId,
      status: 'PLANNED',
      totalDistanceKm: 148,
      totalDurationMinutes: 175,
      estimatedCost: cost,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.fallbackTrips.set(tripId, trip);
    return trip;
  }

  async getTrip(tripId: string, userId?: string): Promise<Trip> {
    const trip = this.fallbackTrips.get(tripId);
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }
    if (userId && trip.userId !== userId) {
      throw new ForbiddenException('You do not have access to this trip');
    }
    return trip;
  }

  async listUserTrips(userId: string): Promise<Trip[]> {
    return Array.from(this.fallbackTrips.values()).filter((t) => t.userId === userId);
  }

  async getTripExplanation(tripId: string, userId?: string): Promise<TripExplanation> {
    const trip = await this.getTrip(tripId, userId);
    const vehicle = trip.vehicle || (await this.vehiclesService.getVehicle(trip.vehicleId));

    // Create contextual synthesis for AI reasoning
    const tripContext: TripContext = {
      tripId: trip.id,
      vehicle,
      route: {
        id: trip.selectedRouteId,
        name: 'National Corridor NH-48',
        summary: 'Recommended fastest express corridor',
        distanceKm: trip.totalDistanceKm,
        durationMinutes: trip.totalDurationMinutes,
        geometry: { type: 'LineString', coordinates: [] },
        traffic: {
          overallSeverity: 'LIGHT',
          delayMinutes: 5,
          bottlenecksCount: 1,
          summary: 'Smooth highway progression',
        },
        toll: {
          totalCost: trip.estimatedCost.tollCost,
          currency: 'INR',
          tollPlazasCount: 2,
          electronicTollCovered: true,
          plazas: [],
        },
        energy: {
          fuelType: vehicle.fuelType,
          estimatedConsumption: 10.2,
          consumptionUnit: vehicle.fuelType === 'EV' ? 'KWH' : 'LITRES',
          estimatedCost: trip.estimatedCost.fuelCost,
          currency: 'INR',
          sufficientInitialLevel: true,
          requiredRefuelCount: 0,
        },
        road: {
          highwayPercentage: 85,
          surfaceCondition: 'EXCELLENT',
          terrain: 'PLAIN',
        },
        safety: {
          overallScore: 92,
          rating: 'HIGH',
          nightDrivingRisk: 'LOW',
          knownIncidents: [],
          emergencyServicesNearbyCount: 4,
          summary: 'High safety rating',
        },
        weather: {
          dominantCondition: 'CLEAR',
          temperatureCelsius: 28,
          visibilityKm: 10,
          precipitationProbability: 5,
          windSpeedKmh: 12,
          warnings: [],
          summary: 'Clear skies',
        },
        usefulStops: [],
        segments: [],
      },
    };

    return this.aiService.explainTrip(tripContext);
  }
}
