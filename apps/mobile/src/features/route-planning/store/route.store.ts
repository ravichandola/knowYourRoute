import { create } from 'zustand';
import { RoutePlanRequest, RouteProfile, Waypoint } from '@know-your-route/contracts';

interface RouteStoreState {
  origin: Waypoint | null;
  destination: Waypoint | null;
  selectedRouteId: string | null;
  selectedRoute: RouteProfile | null;
  setOrigin: (origin: Waypoint | null) => void;
  setDestination: (destination: Waypoint | null) => void;
  setSelectedRoute: (route: RouteProfile | null) => void;
  clearPlan: () => void;
}

export const useRouteStore = create<RouteStoreState>((set) => ({
  origin: {
    name: 'Mumbai Central',
    location: { latitude: 18.9696, longitude: 72.8193 },
  },
  destination: {
    name: 'Pune Shivaji Nagar',
    location: { latitude: 18.5314, longitude: 73.8446 },
  },
  selectedRouteId: null,
  selectedRoute: null,

  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setSelectedRoute: (selectedRoute) =>
    set({
      selectedRoute,
      selectedRouteId: selectedRoute ? selectedRoute.id : null,
    }),
  clearPlan: () =>
    set({
      selectedRouteId: null,
      selectedRoute: null,
    }),
}));
