import { Injectable } from '@nestjs/common';
import { ITollProvider } from './toll.interface';
import { TollContext } from '@know-your-route/types';

@Injectable()
export class MockTollAdapter implements ITollProvider {
  async calculateTolls(routeCoordinates: [number, number][]): Promise<TollContext> {
    return {
      totalCost: 280,
      currency: 'INR',
      tollPlazasCount: 2,
      electronicTollCovered: true,
      plazas: [
        {
          id: 'toll_p1',
          name: 'Main Expressway Plaza',
          cost: 160,
          location: { latitude: 18.9, longitude: 73.1 },
        },
        {
          id: 'toll_p2',
          name: 'Corridor Exit Plaza',
          cost: 120,
          location: { latitude: 18.7, longitude: 73.5 },
        },
      ],
    };
  }
}
