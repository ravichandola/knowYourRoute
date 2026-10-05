import { Platform, ViewStyle, TextStyle } from 'react-native';

/** Pointer cursor for interactive elements on web. */
export const webInteractive: ViewStyle =
  Platform.OS === 'web' ? ({ cursor: 'pointer' } as ViewStyle) : {};

/** Full viewport height on web. */
export const webMinHeight: ViewStyle =
  Platform.OS === 'web' ? ({ minHeight: '100vh' } as unknown as ViewStyle) : { flex: 1 };

/** Prevent text selection on buttons (web). */
export const webNoSelect: TextStyle =
  Platform.OS === 'web' ? ({ userSelect: 'none' } as TextStyle) : {};
