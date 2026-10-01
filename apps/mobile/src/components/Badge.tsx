import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  return (
    <View style={[styles.badge, styles[variant], styles[`size_${size}`], style]}>
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  size_sm: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.xs + 2,
  },
  size_md: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm + 2,
  },
  primary: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  neutral: {
    backgroundColor: theme.colors.surfaceLight,
  },
  info: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textSize_sm: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  textSize_md: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  text_primary: {
    color: theme.colors.brand[400],
  },
  text_success: {
    color: theme.colors.emerald[500],
  },
  text_warning: {
    color: theme.colors.warning,
  },
  text_danger: {
    color: theme.colors.danger,
  },
  text_neutral: {
    color: theme.colors.textSecondary,
  },
  text_info: {
    color: theme.colors.info,
  },
});
