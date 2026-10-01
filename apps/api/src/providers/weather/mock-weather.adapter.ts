import { Injectable } from '@nestjs/common';
import { IWeatherProvider } from './weather.interface';
import { LatLng, WeatherContext } from '@know-your-route/types';

@Injectable()
export class MockWeatherAdapter implements IWeatherProvider {
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

  async getCurrentWeather(location: LatLng): Promise<WeatherContext> {
    return {
      dominantCondition: 'CLEAR',
      temperatureCelsius: 28,
      visibilityKm: 10,
      precipitationProbability: 10,
      windSpeedKmh: 14,
      warnings: [],
      summary: 'Pleasant weather, ideal visibility.',
    };
  }
}
