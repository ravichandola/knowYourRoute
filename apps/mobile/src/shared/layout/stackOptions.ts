import { theme } from '../theme';

/** Shared stack options for grouped flows (auth, onboarding). */
export const groupStackScreenOptions = {
  headerShown: false as const,
  contentStyle: { backgroundColor: theme.colors.background },
};
