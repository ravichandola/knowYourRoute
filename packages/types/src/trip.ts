import { RouteProfile, Waypoint } from './route';
import { VehicleProfile } from './vehicle';

export type TripStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface TripCostBreakdown {
  fuelCost: number;
  tollCost: number;
  otherCharges: number;
  totalCost: number;
  currency: string;
}

export interface TripPreference {
  id?: string;
  userId?: string;
  preferredStopsIntervalKm?: number;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  maxDrivingHoursPerDay?: number;
  drivingStyle?: 'ECONOMICAL' | 'BALANCED' | 'SPIRITED';
}

export interface Trip {
  id: string;
  userId: string;
  vehicleId: string;
  vehicle?: VehicleProfile;
  origin: Waypoint;
  destination: Waypoint;
  selectedRouteId: string;
  selectedRoute?: RouteProfile;
  status: TripStatus;
  startedAt?: string;
  completedAt?: string;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  estimatedCost: TripCostBreakdown;
  actualCost?: TripCostBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface TripContext {
  tripId?: string;
  vehicle: VehicleProfile;
  route: RouteProfile;
  preferences?: TripPreference;
  userContext?: {
    drivingExperienceYears?: number;
  };
}

export type LiveTripEventType =
  | 'TRAFFIC_CHANGED'
  | 'WEATHER_CHANGED'
  | 'INCIDENT_DETECTED'
  | 'ROUTE_DELAYED'
  | 'STOP_RECOMMENDED'
  | 'VEHICLE_STATE_UPDATED';

export interface LiveTripEvent {
  id: string;
  tripId: string;
  type: LiveTripEventType;
  severity: 'INFO' | 'WARNING' | 'ALERT';
  message: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
