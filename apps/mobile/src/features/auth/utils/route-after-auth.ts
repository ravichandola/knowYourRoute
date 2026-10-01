import type { Router } from 'expo-router';
import { routes } from '@/shared/navigation';

export function routeAfterAuth(router: Router, isOnboarded: boolean) {
  if (isOnboarded) {
    router.replace(routes.tabs.home);
  } else {
    router.replace(routes.onboarding.welcome);
  }
}
