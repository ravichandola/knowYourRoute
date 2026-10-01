import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { routes } from '@/shared/navigation';
import { Screen } from '@/shared/layout';
import { Header, Card, Button, Badge, LoadingState } from '@/shared/ui';
import { useTripDetail } from '../hooks/useTrip';
import { theme } from '@/shared/theme';
import {
  Navigation,
  CircleDollarSign,
  Fuel,
  CreditCard,
  Play,
  Calendar,
  ShieldCheck,
} from 'lucide-react-native';

export default function TripOverviewScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { data: trip, isLoading } = useTripDetail(tripId || '');

  if (isLoading || !trip) {
    return (
      <Screen header={<Header title="Trip Details" />} scroll={false}>
        <LoadingState message="Fetching trip record..." />
      </Screen>
    );
  }

  return (
    <Screen
      header={
        <Header
          title={`${trip.origin.name} ➔ ${trip.destination.name}`}
          subtitle={`Status: ${trip.status}`}
        />
      }
      contentContainerStyle={styles.container}
    >
        {/* Overview Metric Card */}
        <Card style={styles.overviewCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.tripTitle}>Trip Intelligence Overview</Text>
              <Text style={styles.dateText}>
                Planned on {new Date(trip.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Badge label={trip.status} variant="success" />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Total Distance</Text>
              <Text style={styles.metricVal}>{trip.totalDistanceKm} km</Text>
            </View>

            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Est. Duration</Text>
              <Text style={styles.metricVal}>
                {Math.round(trip.totalDurationMinutes / 60)}h {trip.totalDurationMinutes % 60}m
              </Text>
            </View>

            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Total Est. Cost</Text>
              <Text style={[styles.metricVal, { color: theme.colors.emerald[500] }]}>
                {trip.estimatedCost.currency} {trip.estimatedCost.totalCost}
              </Text>
            </View>
          </View>
        </Card>

        {/* Cost Breakdown Engine (Section 12) */}
        <Card style={styles.costCard}>
          <Text style={styles.sectionTitle}>Trip Cost Engine Breakdown</Text>

          <View style={styles.costItem}>
            <View style={styles.costLabelWrapper}>
              <Fuel size={16} color={theme.colors.warning} />
              <Text style={styles.costLabel}>Fuel / Energy Cost</Text>
            </View>
            <Text style={styles.costVal}>
              {trip.estimatedCost.currency} {trip.estimatedCost.fuelCost}
            </Text>
          </View>

          <View style={styles.costItem}>
            <View style={styles.costLabelWrapper}>
              <CreditCard size={16} color={theme.colors.emerald[500]} />
              <Text style={styles.costLabel}>FASTag Toll Charges</Text>
            </View>
            <Text style={styles.costVal}>
              {trip.estimatedCost.currency} {trip.estimatedCost.tollCost}
            </Text>
          </View>

          <View style={[styles.costItem, styles.costTotalRow]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalVal}>
              {trip.estimatedCost.currency} {trip.estimatedCost.totalCost}
            </Text>
          </View>
        </Card>

        <Button
          title="Resume Live HUD"
          size="lg"
          variant="primary"
          icon={<Play size={18} color={theme.colors.white} />}
          onPress={() => router.push(routes.trip.live)}
          style={styles.actionBtn}
        />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  overviewCard: {
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  metric: {
    alignItems: 'flex-start',
  },
  metricLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  costCard: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  costLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  costVal: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  costTotalRow: {
    borderBottomWidth: 0,
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  totalVal: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.emerald[500],
  },
  actionBtn: {
    marginTop: theme.spacing.md,
  },
});
