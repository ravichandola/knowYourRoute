import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProfile } from '@know-your-route/contracts';
import { Card, Badge } from '@/shared/ui';
import { theme } from '@/shared/theme';
import { Clock, Fuel, Shield, CircleDollarSign, Check } from 'lucide-react-native';

interface RouteCardProps {
  route: RouteProfile;
  isSelected?: boolean;
  onPress?: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected,
  onPress,
}) => {
  const hours = Math.floor(route.durationMinutes / 60);
  const minutes = route.durationMinutes % 60;
  const timeDisplay = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;

  return (
    <Card
      onPress={onPress}
      style={[styles.card, isSelected ? styles.selectedCard : null]}
    >
      {/* Header with Title & Tags */}
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <Text style={styles.routeName}>{route.name}</Text>
          <Text style={styles.routeSummary} numberOfLines={2}>
            {route.summary}
          </Text>
        </View>

        <View style={styles.badgesCol}>
          {route.isRecommended && (
            <Badge label="RECOMMENDED" variant="success" size="sm" style={styles.badgeMargin} />
          )}
          {route.tag && (
            <Badge label={route.tag} variant="primary" size="sm" />
          )}
        </View>
      </View>

      {/* Primary Metrics: Time & Distance */}
      <View style={styles.metricRow}>
        <View style={styles.primaryMetric}>
          <Clock size={16} color={theme.colors.brand[400]} />
          <Text style={styles.timeText}>{timeDisplay}</Text>
          <Text style={styles.distanceText}>({route.distanceKm} km)</Text>
        </View>

        <Badge
          label={`TRAFFIC: ${route.traffic.overallSeverity}`}
          variant={route.traffic.overallSeverity === 'LIGHT' ? 'success' : 'warning'}
          size="sm"
        />
      </View>

      {/* Intelligence Context Grid: Toll, Energy, Safety */}
      <View style={styles.contextGrid}>
        {/* Toll Context */}
        <View style={styles.gridItem}>
          <CircleDollarSign size={14} color={theme.colors.emerald[500]} />
          <Text style={styles.gridLabel}>Toll: {route.toll.currency} {route.toll.totalCost}</Text>
        </View>

        {/* Energy Context */}
        <View style={styles.gridItem}>
          <Fuel size={14} color={theme.colors.warning} />
          <Text style={styles.gridLabel}>Fuel: ~{route.energy.estimatedCost} {route.energy.currency}</Text>
        </View>

        {/* Safety Context */}
        <View style={styles.gridItem}>
          <Shield size={14} color={theme.colors.brand[400]} />
          <Text style={styles.gridLabel}>Safety: {route.safety.overallScore}/100</Text>
        </View>
      </View>

      {/* Selection indicator */}
      {isSelected && (
        <View style={styles.selectedBanner}>
          <Check size={14} color={theme.colors.emerald[500]} />
          <Text style={styles.selectedText}>Selected Route</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  selectedCard: {
    borderColor: theme.colors.emerald[500],
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrapper: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  routeName: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  routeSummary: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  badgesCol: {
    alignItems: 'flex-end',
  },
  badgeMargin: {
    marginBottom: 4,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  primaryMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginLeft: 6,
  },
  distanceText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  contextGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.emerald[500],
    marginLeft: 4,
  },
});
