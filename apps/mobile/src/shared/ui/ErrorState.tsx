import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Button } from './Button';
import { theme } from '../theme';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Unable to fetch data. Please try again.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <AlertCircle size={28} color={theme.colors.warning} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title="Retry"
          size="sm"
          variant="outline"
          onPress={onRetry}
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    ...theme.shadows.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  message: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  retryButton: {
    minWidth: 120,
  },
});
