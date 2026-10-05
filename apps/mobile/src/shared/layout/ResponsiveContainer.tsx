import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { theme } from '../theme';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
  /** Center content on web with a subtle page background. */
  centered?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth,
  style,
  centered = true,
}) => {
  const { isWeb, contentMaxWidth, pageMaxWidth } = useResponsive();
  const resolvedMaxWidth = maxWidth ?? pageMaxWidth ?? contentMaxWidth;

  if (!isWeb || !resolvedMaxWidth) {
    return <View style={[styles.nativeFill, style]}>{children}</View>;
  }

  return (
    <View style={[styles.webPage, centered && styles.webPageCentered]}>
      <View style={[styles.webFrame, { maxWidth: resolvedMaxWidth }, style]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeFill: {
    flex: 1,
  },
  webPage: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.surfaceMuted,
  },
  webPageCentered: {
    alignItems: 'center',
  },
  webFrame: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
        }
      : {}),
  },
});
