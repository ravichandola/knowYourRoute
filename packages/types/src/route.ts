import { EnergyContext } from './energy';
import { FastagContext } from './fastag';
import { SafetyContext } from './safety';
import { WeatherContext } from './weather';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Waypoint {
  name: string;
  address?: string;
  location: LatLng;
}

export type TrafficSeverity = 'LIGHT' | 'MODERATE' | 'HEAVY' | 'CONGESTED';

export interface TrafficContext {
  overallSeverity: TrafficSeverity;
  delayMinutes: number;
  bottlenecksCount: number;
  summary: string;
}

export interface TollContext {
  totalCost: number;
  currency: string;
  tollPlazasCount: number;
  electronicTollCovered: boolean;
  plazas: {
    id: string;
    name: string;
    cost: number;
    location: LatLng;
  }[];
}

export interface RoadContext {
  highwayPercentage: number;
  surfaceCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  terrain: 'PLAIN' | 'HILLY' | 'GHAT' | 'COASTAL';
  laneQualityNotes?: string;
}

export interface Stop {
  id: string;
  name: string;
  category: 'FUEL' | 'EV_CHARGING' | 'FOOD' | 'REST_AREA' | 'HOSPITAL' | 'SCENIC';
  distanceFromOriginKm: number;
  detourMinutes: number;
  rating?: number;
  amenities: string[];
  location: LatLng;
}

export interface RouteSegment {
  id: string;
  segmentIndex: number;
  startLocation: LatLng;
  endLocation: LatLng;
  distanceKm: number;
  durationMinutes: number;
  roadName: string;
  trafficSeverity: TrafficSeverity;
  safetyScore: number; // 0 - 100
  weatherRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RouteProfile {
  id: string;
  name: string;
  summary: string;
  isRecommended?: boolean;
  tag?: 'FASTEST' | 'ECONOMICAL' | 'SCENIC' | 'SAFEST';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [longitude, latitude]
  };
  distanceKm: number;
  durationMinutes: number;
  traffic: TrafficContext;
  toll: TollContext;
  energy: EnergyContext;
  fastag?: FastagContext;
  road: RoadContext;
  safety: SafetyContext;
  weather: WeatherContext;
  usefulStops: Stop[];
  segments: RouteSegment[];
}

export interface RoutePlanRequest {
  origin: Waypoint;
  destination: Waypoint;
  waypoints?: Waypoint[];
  vehicleId?: string;
  departureTime?: string;
  preferences?: {
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    preferScenic?: boolean;
    prioritizeSafety?: boolean;
  };
}

export interface RoutePlanResponse {
  searchId: string;
  origin: Waypoint;
  destination: Waypoint;
  routes: RouteProfile[];
  generatedAt: string;
}
