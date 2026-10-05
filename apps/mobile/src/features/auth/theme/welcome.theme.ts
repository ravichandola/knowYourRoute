/** Welcome / login screen design tokens (reference mockup). */
export const welcomeTheme = {
  colors: {
    primary: '#087F6B',
    primaryPressed: '#066B5A',
    textPrimary: '#0B1F44',
    textSecondary: '#667085',
    textOnHero: '#FFFFFF',
    background: '#FFFFFF',
    border: '#E5E7EB',
    link: '#2563EB',
    heroOverlayTop: 'rgba(0, 0, 0, 0.42)',
    heroOverlayMid: 'rgba(0, 0, 0, 0.18)',
    heroOverlayBottom: 'rgba(0, 0, 0, 0.08)',
    skipPill: 'rgba(0, 0, 0, 0.38)',
    featureIconBg: 'rgba(255, 255, 255, 0.18)',
  },
  radius: {
    sheet: 30,
    button: 14,
    skip: 20,
    logo: 20,
    featureIcon: 999,
  },
  spacing: {
    sheetHorizontal: 24,
    sheetTop: 28,
  },
  sizes: {
    primaryButtonHeight: 56,
    socialButtonHeight: 54,
    dragIndicatorWidth: 40,
    dragIndicatorHeight: 4,
  },
} as const;
