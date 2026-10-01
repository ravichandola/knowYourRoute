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
    paddingHorizontal: theme.spacing.sm,
  },
  size_md: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm + 2,
  },
  primary: {
    backgroundColor: theme.colors.primaryLight,
  },
  success: {
    backgroundColor: theme.colors.primaryLight,
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  neutral: {
    backgroundColor: theme.colors.surfaceLight,
  },
  info: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  text: {
    fontWeight: '600',
  },
  textSize_sm: {
    fontSize: 10,
  },
  textSize_md: {
    fontSize: 11,
  },
  text_primary: {
    color: theme.colors.primary,
  },
  text_success: {
    color: theme.colors.accent,
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
    color: theme.colors.link,
  },
});
