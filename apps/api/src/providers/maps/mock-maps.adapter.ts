import { Injectable } from '@nestjs/common';
import { IMapsProvider } from './maps.interface';
import { LatLng, RoutePlanRequest, RouteProfile } from '@know-your-route/types';

@Injectable()
export class MockMapsAdapter implements IMapsProvider {
  async calculateRoutes(request: RoutePlanRequest): Promise<RouteProfile[]> {
    const origin = request.origin.location;
    const dest = request.destination.location;

    // Approximate straight-line distance in km (Haversine approx)
    const latDiff = (dest.latitude - origin.latitude) * 111;
    const lngDiff = (dest.longitude - origin.longitude) * 100;
    const baseDistance = Math.max(15, Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 1.2));
    const baseDuration = Math.round(baseDistance * 1.3); // ~46 km/h avg

    // Generate 3 distinct routes: Fastest, Scenic/Alternative, Economical/Safe
    const route1: RouteProfile = {
      id: 'route_expressway_1',
      name: 'Via National Highway / Expressway',
      summary: 'Fastest route, excellent multi-lane expressway with smooth traffic flow',
      isRecommended: true,
      tag: 'FASTEST',
      distanceKm: baseDistance,
      durationMinutes: baseDuration,
      geometry: {
        type: 'LineString',
        coordinates: [
          [origin.longitude, origin.latitude],
          [(origin.longitude + dest.longitude) / 2, (origin.latitude + dest.latitude) / 2],
          [dest.longitude, dest.latitude],
        ],
      },
      traffic: {
        overallSeverity: 'LIGHT',
        delayMinutes: 4,
        bottlenecksCount: 1,
        summary: 'Smooth flowing expressway traffic with minor toll approach slowdown.',
      },
      toll: {
        totalCost: 320,
        currency: 'INR',
        tollPlazasCount: 2,
        electronicTollCovered: true,
        plazas: [
          {
            id: 'toll_1',
            name: 'Expressway Gateway Plaza',
            cost: 165,
            location: {
              latitude: (origin.latitude * 2 + dest.latitude) / 3,
              longitude: (origin.longitude * 2 + dest.longitude) / 3,
            },
          },
          {
            id: 'toll_2',
            name: 'Valley Exit Toll',
            cost: 155,
            location: {
              latitude: (origin.latitude + dest.latitude * 2) / 3,
              longitude: (origin.longitude + dest.longitude * 2) / 3,
            },
          },
        ],
      },
      energy: {
        fuelType: 'PETROL',
        estimatedConsumption: Number((baseDistance / 15.2).toFixed(1)),
        consumptionUnit: 'LITRES',
        estimatedCost: Math.round((baseDistance / 15.2) * 105),
        currency: 'INR',
        sufficientInitialLevel: true,
        requiredRefuelCount: 0,
      },
      road: {
        highwayPercentage: 85,
        surfaceCondition: 'EXCELLENT',
        terrain: 'PLAIN',
        laneQualityNotes: '6-lane asphalt with clear thermoplastic markings and night cat-eyes.',
      },
      safety: {
        overallScore: 92,
        rating: 'HIGH',
        nightDrivingRisk: 'LOW',
        knownIncidents: [],
        emergencyServicesNearbyCount: 4,
        summary: 'Highway patrol active, well-lit junctions, full crash barriers.',
      },
      weather: {
        dominantCondition: 'CLEAR',
        temperatureCelsius: 29,
        visibilityKm: 10,
        precipitationProbability: 5,
        windSpeedKmh: 12,
        warnings: [],
        summary: 'Clear skies, pleasant driving visibility.',
      },
      usefulStops: [
        {
          id: 'stop_1',
          name: 'Highway Food Oasis & Fuel Hub',
          category: 'FOOD',
          distanceFromOriginKm: Math.round(baseDistance * 0.4),
          detourMinutes: 2,
          rating: 4.6,
          amenities: ['Clean Washrooms', 'EV Fast Charger 60kW', 'Family Restaurant', 'ATM'],
          location: {
            latitude: (origin.latitude + dest.latitude) / 2,
            longitude: (origin.longitude + dest.longitude) / 2,
          },
        },
      ],
      segments: [
        {
          id: 'seg_1',
          segmentIndex: 0,
          startLocation: origin,
          endLocation: {
            latitude: (origin.latitude + dest.latitude) / 2,
            longitude: (origin.longitude + dest.longitude) / 2,
          },
          distanceKm: Math.round(baseDistance * 0.5),
          durationMinutes: Math.round(baseDuration * 0.45),
          roadName: 'State Link & Tollway Entry',
          trafficSeverity: 'LIGHT',
          safetyScore: 90,
          weatherRisk: 'LOW',
        },
        {
          id: 'seg_2',
          segmentIndex: 1,
          startLocation: {
            latitude: (origin.latitude + dest.latitude) / 2,
            longitude: (origin.longitude + dest.longitude) / 2,
          },
          endLocation: dest,
          distanceKm: Math.round(baseDistance * 0.5),
          durationMinutes: Math.round(baseDuration * 0.55),
          roadName: 'National Corridor',
          trafficSeverity: 'LIGHT',
          safetyScore: 94,
          weatherRisk: 'LOW',
        },
      ],
    };

    const route2: RouteProfile = {
      id: 'route_bypass_2',
      name: 'Via State Highway Bypass',
      summary: 'Lower toll expenses, passes through scenic countryside towns',
      isRecommended: false,
      tag: 'ECONOMICAL',
      distanceKm: Math.round(baseDistance * 1.08),
      durationMinutes: Math.round(baseDuration * 1.2),
      geometry: {
        type: 'LineString',
        coordinates: [
          [origin.longitude, origin.latitude],
          [(origin.longitude + dest.longitude) / 2 + 0.05, (origin.latitude + dest.latitude) / 2 - 0.03],
          [dest.longitude, dest.latitude],
        ],
      },
      traffic: {
        overallSeverity: 'MODERATE',
        delayMinutes: 18,
        bottlenecksCount: 3,
        summary: 'Moderate traffic near town intersections and market zones.',
      },
      toll: {
        totalCost: 110,
        currency: 'INR',
        tollPlazasCount: 1,
        electronicTollCovered: true,
        plazas: [
          {
            id: 'toll_state_1',
            name: 'State Border Toll Point',
            cost: 110,
            location: {
              latitude: (origin.latitude + dest.latitude) / 2,
              longitude: (origin.longitude + dest.longitude) / 2,
            },
          },
        ],
      },
      energy: {
        fuelType: 'PETROL',
        estimatedConsumption: Number(((baseDistance * 1.08) / 14.1).toFixed(1)),
        consumptionUnit: 'LITRES',
        estimatedCost: Math.round(((baseDistance * 1.08) / 14.1) * 105),
        currency: 'INR',
        sufficientInitialLevel: true,
        requiredRefuelCount: 0,
      },
      road: {
        highwayPercentage: 45,
        surfaceCondition: 'GOOD',
        terrain: 'PLAIN',
        laneQualityNotes: '4-lane divided highway with occasional two-lane town transits.',
      },
      safety: {
        overallScore: 81,
        rating: 'MODERATE',
        nightDrivingRisk: 'MEDIUM',
        knownIncidents: [
          {
            id: 'inc_1',
            type: 'POOR_LIGHTING',
            severity: 'CAUTION',
            locationKm: Math.round(baseDistance * 0.6),
            description: 'Unlit stretch through farmland for 8 km.',
          },
        ],
        emergencyServicesNearbyCount: 2,
        summary: 'Care advised after dusk near market crossings.',
      },
      weather: {
        dominantCondition: 'CLEAR',
        temperatureCelsius: 29,
        visibilityKm: 9,
        precipitationProbability: 10,
        windSpeedKmh: 10,
        warnings: [],
        summary: 'Dry and clear.',
      },
      usefulStops: [
        {
          id: 'stop_state_1',
          name: 'Greenway Dhaba & Tea Point',
          category: 'FOOD',
          distanceFromOriginKm: Math.round(baseDistance * 0.5),
          detourMinutes: 1,
          rating: 4.4,
          amenities: ['Authentic Meals', 'Tea & Refreshments', 'Parking'],
          location: {
            latitude: (origin.latitude + dest.latitude) / 2,
            longitude: (origin.longitude + dest.longitude) / 2,
          },
        },
      ],
      segments: [],
    };

    return [route1, route2];
  }

  async geocode(address: string): Promise<LatLng[]> {
    // Mock geocode for quick testing
    return [
      { latitude: 19.076, longitude: 72.8777 },
      { latitude: 28.6139, longitude: 77.209 },
      { latitude: 12.9716, longitude: 77.5946 },
    ];
  }

  async reverseGeocode(coords: LatLng): Promise<string> {
    return `Location near ${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`;
  }
}
