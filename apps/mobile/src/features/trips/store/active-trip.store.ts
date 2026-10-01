import { create } from 'zustand';
import type { RouteProfile, Trip, Waypoint } from '@know-your-route/contracts';

export interface ActiveTrip {
  trip: Trip;
  route: RouteProfile;
  origin: Waypoint;
  destination: Waypoint;
}

interface ActiveTripState {
  activeTrip: ActiveTrip | null;
  setActiveTrip: (activeTrip: ActiveTrip | null) => void;
}

/** What the live trip HUD shows. Filled when a trip is started; owned by the trips feature. */
export const useActiveTripStore = create<ActiveTripState>((set) => ({
  activeTrip: null,
  setActiveTrip: (activeTrip) => set({ activeTrip }),
}));
