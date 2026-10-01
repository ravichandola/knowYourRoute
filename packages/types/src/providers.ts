import { LatLng, RoutePlanRequest, RouteProfile, Stop } from './route';
import { VehicleProfile, VehicleSnapshot } from './vehicle';
import { WeatherContext } from './weather';
import { TollContext } from './route';
import { FastagContext } from './fastag';

export interface MapsProvider {
  calculateRoutes(request: RoutePlanRequest): Promise<RouteProfile[]>;
  geocode(address: string): Promise<LatLng[]>;
  reverseGeocode(coords: LatLng): Promise<string>;
}

export interface WeatherProvider {
  getWeatherAlongRoute(points: LatLng[]): Promise<WeatherContext>;
  getCurrentWeather(location: LatLng): Promise<WeatherContext>;
}

export interface TollProvider {
  calculateTolls(routeCoordinates: [number, number][]): Promise<TollContext>;
}

export interface PlacesProvider {
  findStopsAlongRoute(
    routeCoordinates: [number, number][],
    categories: Stop['category'][]
  ): Promise<Stop[]>;
}

export interface FastagProvider {
  getFastagStatus(tagNumber: string): Promise<FastagContext>;
}

export interface VehicleProvider {
  fetchConnectedVehicleTelemetry(vinOrId: string): Promise<Partial<VehicleProfile>>;
  processDashboardImage(imageBuffer: Uint8Array | ArrayBuffer): Promise<Partial<VehicleSnapshot>>;
}
