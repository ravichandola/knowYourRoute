import { Platform, useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type ResponsiveLayout = 'mobile' | 'tablet' | 'desktop';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';
  const isNative = !isWeb;
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  const isCompact = width < BREAKPOINTS.md;
  const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
  const isDesktop = width >= BREAKPOINTS.lg;
  const isLandscape = width > height;

  /** Phone-style stacked layout (native apps + narrow web viewports). */
  const useMobileLayout = isNative || isCompact;

  /** Split hero + auth panel (web tablet/desktop). */
  const useWebSplitLayout = isWeb && !isCompact;

  const layout: ResponsiveLayout = useMobileLayout
    ? 'mobile'
    : isDesktop
      ? 'desktop'
      : 'tablet';

  const contentMaxWidth = useMobileLayout
    ? isWeb
      ? BREAKPOINTS.sm
      : undefined
    : isDesktop
      ? 520
      : 480;

  const pageMaxWidth = useWebSplitLayout ? undefined : isWeb ? BREAKPOINTS.sm : undefined;

  return {
    width,
    height,
    isWeb,
    isNative,
    isIOS,
    isAndroid,
    isCompact,
    isTablet,
    isDesktop,
    isLandscape,
    useMobileLayout,
    useWebSplitLayout,
    layout,
    contentMaxWidth,
    pageMaxWidth,
  };
}
