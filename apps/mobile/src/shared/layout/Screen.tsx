import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { theme } from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Stays fixed above the scroll body. */
  header?: React.ReactNode;
  /** Wrap children in a ScrollView. Set false when the screen owns its own scroller. */
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  header,
  scroll = true,
  contentContainerStyle,
  keyboardShouldPersistTaps,
  backgroundColor = theme.colors.background,
  style,
}: ScreenProps) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }, style]}>
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
