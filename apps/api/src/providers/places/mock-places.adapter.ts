import { Injectable } from '@nestjs/common';
import { IPlacesProvider } from './places.interface';
import { Stop } from '@know-your-route/types';

@Injectable()
export class MockPlacesAdapter implements IPlacesProvider {
  async findStopsAlongRoute(
    routeCoordinates: [number, number][],
    categories: Stop['category'][]
  ): Promise<Stop[]> {
    return [
      {
        id: 'stop_hpcl_oasis',
        name: 'HPCL AutoCare & Electric Fast Hub',
        category: 'FUEL',
        distanceFromOriginKm: 55,
        detourMinutes: 1,
        rating: 4.7,
        amenities: ['Power Diesel & XP95', '60kW CCS2 EV Charger', 'Nitrogen Air', 'Clean Restrooms'],
        location: { latitude: 18.85, longitude: 73.22 },
      },
      {
        id: 'stop_express_foodcourt',
        name: 'Grand Highway Plaza & Food Court',
        category: 'FOOD',
        distanceFromOriginKm: 78,
        detourMinutes: 3,
        rating: 4.5,
        amenities: ['Multiple Restaurants', 'Children Play Area', 'Coffee Shop', 'ATM'],
        location: { latitude: 18.78, longitude: 73.35 },
      },
      {
        id: 'stop_tata_ev_supercharge',
        name: 'Tata Power EZ Charge Super Hub',
        category: 'EV_CHARGING',
        distanceFromOriginKm: 92,
        detourMinutes: 2,
        rating: 4.8,
        amenities: ['Dual 120kW DC Fast Chargers', 'Cafe Lounge', 'WiFi'],
        location: { latitude: 18.72, longitude: 73.48 },
      },
    ];
  }
}
