import type { RouteProfile } from '../routing/route.types';
import type { Waypoint } from '../shared';
import type { VehicleProfile } from '../vehicles/types';

export type TripStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface TripCostBreakdown {
  fuelCost: number;
  tollCost: number;
  otherCharges: number;
  totalCost: number;
  currency: string;
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

export interface TripExplanation {
  headline: string;
  rationale: string;
  keyHighlights: string[];
  safetyAdvisories: string[];
  fuelEfficiencyTip: string;
  stopRecommendations: string[];
}
