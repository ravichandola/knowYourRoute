import { colors, spacing, radius, typography, shadows } from '@know-your-route/ui';

export { colors, spacing, radius, typography, shadows };

export const theme = {
  colors: {
    ...colors,
    background: colors.slate[950],
    surface: colors.slate[900],
    surfaceLight: colors.slate[800],
    surfaceBorder: colors.slate[700],
    textPrimary: colors.white,
    textSecondary: colors.slate[400],
    textMuted: colors.slate[500],
    primary: colors.brand[500],
    primaryHover: colors.brand[600],
    accent: colors.emerald[500],
  },
  spacing,
  radius,
  typography,
  shadows,
};

export type Theme = typeof theme;
