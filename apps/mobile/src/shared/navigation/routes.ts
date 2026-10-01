import type { Router } from 'expo-router';

type AppHref = Parameters<Router['push']>[0];

/**
 * Every navigable screen. Route files in `app/` stay thin re-exports;
 * screens and hooks move through these paths.
 */
export const routes = {
  landing: '/',
  auth: {
    login: '/(auth)/login',
    signup: '/(auth)/signup',
    mobileLogin: '/(auth)/mobile-login',
  },
  onboarding: {
    welcome: '/(onboarding)/welcome',
    vehicle: '/(onboarding)/vehicle',
    permissions: '/(onboarding)/permissions',
  },
  tabs: {
    home: '/(tabs)/home',
    trips: '/(tabs)/trips',
    vehicle: '/(tabs)/vehicle',
    profile: '/(tabs)/profile',
  },
  plan: {
    index: '/plan',
    routes: '/plan/routes',
    detail: '/plan/route-detail',
  },
  trip: {
    live: '/trip/live',
  },
} as const;

export function tripDetailHref(tripId: string): AppHref {
  return `/trip/${tripId}`;
}

export function planRoutesHref(routesData: string): AppHref {
  return {
    pathname: routes.plan.routes,
    params: { routesData },
  };
}

export function planDetailHref(routeJson: string): AppHref {
  return {
    pathname: routes.plan.detail,
    params: { routeJson },
  };
}
