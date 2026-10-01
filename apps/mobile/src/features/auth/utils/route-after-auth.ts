import type { Router } from 'expo-router';

export function routeAfterAuth(router: Router, isOnboarded: boolean) {
  if (isOnboarded) {
    router.replace('/(tabs)/home');
  } else {
    router.replace('/(onboarding)/welcome');
  }
}
