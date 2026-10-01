import { Injectable } from '@nestjs/common';
import type { LatLng, WeatherContext } from '@know-your-route/contracts';
import type { WeatherPort } from '../../domain/ports';

@Injectable()
export class MockWeatherAdapter implements WeatherPort {
  async getWeatherAlongRoute(points: LatLng[]): Promise<WeatherContext> {
    return {
      dominantCondition: 'CLEAR',
      temperatureCelsius: 28,
      visibilityKm: 10,
      precipitationProbability: 10,
      windSpeedKmh: 14,
      warnings: [],
      summary: 'Favorable driving weather with clear skies along the corridor.',
    };
  }
}
