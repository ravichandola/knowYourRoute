import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { CreateTripInput, VehicleProfile } from '@know-your-route/contracts';
import { DEMO_USER_ID, DEMO_VEHICLE_ID } from '../../../platform/demo/demo-data';
import type { TripExplainer } from '../domain/trip-explainer.port';
import type { TripVehicleLookup } from '../domain/vehicle-lookup.port';
import { InMemoryTripRepository } from '../infrastructure/in-memory-trip.repository';
import { MockTripExplainerAdapter } from '../infrastructure/mock-trip-explainer.adapter';
import { TripsService } from './trips.service';

const vehicle: VehicleProfile = {
  id: DEMO_VEHICLE_ID,
  userId: DEMO_USER_ID,
  make: 'Hyundai',
  model: 'Creta',
  fuelType: 'PETROL',
  dataSource: 'USER_CONFIRMED',
};

const input: CreateTripInput = {
  vehicleId: DEMO_VEHICLE_ID,
  origin: { name: 'Mumbai', location: { latitude: 18.97, longitude: 72.82 } },
  destination: { name: 'Pune', location: { latitude: 18.53, longitude: 73.84 } },
  selectedRouteId: 'route_expressway_1',
};

describe('TripsService', () => {
  let vehicles: jest.Mocked<TripVehicleLookup>;
  let explainer: jest.Mocked<TripExplainer>;
  let service: TripsService;

  beforeEach(() => {
    vehicles = { getVehicle: jest.fn().mockResolvedValue(vehicle) };
    const real = new MockTripExplainerAdapter();
    explainer = { explain: jest.fn((context) => real.explain(context)) };
    service = new TripsService(new InMemoryTripRepository(), vehicles, explainer);
  });

  it('creates a planned trip for a vehicle the user owns', async () => {
    const trip = await service.createTrip(DEMO_USER_ID, input);

    expect(vehicles.getVehicle).toHaveBeenCalledWith(DEMO_VEHICLE_ID, DEMO_USER_ID);
    expect(trip.status).toBe('PLANNED');
    expect(trip.vehicle).toEqual(vehicle);
    await expect(service.listUserTrips(DEMO_USER_ID)).resolves.toHaveLength(1);
    await expect(service.listUserTrips('someone-else')).resolves.toHaveLength(0);
  });

  it('hides trips from other users', async () => {
    const trip = await service.createTrip(DEMO_USER_ID, input);

    await expect(service.getTrip(trip.id, 'someone-else')).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.getTrip('missing', DEMO_USER_ID)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('delegates explanation to the explainer port with a built context', async () => {
    const trip = await service.createTrip(DEMO_USER_ID, input);
    const explanation = await service.getTripExplanation(trip.id, DEMO_USER_ID);

    expect(explainer.explain).toHaveBeenCalledWith(
      expect.objectContaining({ tripId: trip.id, vehicle })
    );
    expect(explanation.headline).toContain('Optimal Route');
  });
});
