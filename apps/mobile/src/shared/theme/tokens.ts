import { colors, spacing, radius, typography, shadows } from '@know-your-route/ui';

export { colors, spacing, radius, typography, shadows };

/** Light theme aligned with Know Your Route mockup (white + forest green). */
export const theme = {
  colors: {
    ...colors,
    background: colors.white,
    surface: colors.white,
    surfaceMuted: colors.slate[50],
    surfaceLight: colors.slate[100],
    surfaceBorder: colors.slate[200],
    inputBackground: colors.white,
    textPrimary: colors.slate[900],
    textSecondary: colors.slate[600],
    textMuted: colors.slate[400],
    primary: colors.forest[800],
    primaryHover: colors.forest[900],
    primaryLight: colors.forest[50],
    primaryMuted: colors.forest[100],
    accent: colors.forest[600],
    link: colors.brand[600],
  },
  spacing,
  radius,
  typography,
  shadows,
};

export type Theme = typeof theme;
