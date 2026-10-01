import type { LatLng, WeatherContext } from '@know-your-route/contracts';

export const WEATHER_PORT = 'WEATHER_PORT';
export interface WeatherPort {
  getWeatherAlongRoute(points: LatLng[]): Promise<WeatherContext>;
}
