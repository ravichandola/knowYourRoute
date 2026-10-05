import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { routes, tripDetailHref } from '@/shared/navigation';
import { Screen } from '@/shared/layout';
import { Header, Card, Badge, EmptyState, Button } from '@/shared/ui';
import { useUserTrips } from '../hooks/useTrip';
import { theme } from '@/shared/theme';
import { Compass, Calendar, ArrowRight, CircleDollarSign } from 'lucide-react-native';

export default function TripsScreen() {
  const router = useRouter();
  const { data: trips } = useUserTrips();

  return (
    <Screen
      header={<Header title="My Trips" subtitle="Past journeys & recorded logs" showBack={false} />}
      contentContainerStyle={styles.container}
    >
        {trips && trips.length > 0 ? (
          trips.map((trip) => (
            <Card
              key={trip.id}
              style={styles.tripCard}
              onPress={() => router.push(tripDetailHref(trip.id))}
            >
              <View style={styles.tripHeader}>
                <View>
                  <Text style={styles.corridorName}>
                    {trip.origin.name} ➔ {trip.destination.name}
                  </Text>
                  <View style={styles.dateRow}>
                    <Calendar size={12} color={theme.colors.textMuted} />
                    <Text style={styles.dateText}>
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Badge label={trip.status} variant="success" size="sm" />
              </View>

              <View style={styles.tripMetrics}>
                <Text style={styles.metricText}>
                  {trip.totalDistanceKm} km • {Math.round(trip.totalDurationMinutes / 60)}h{' '}
                  {trip.totalDurationMinutes % 60}m
                </Text>
                <View style={styles.costBadge}>
                  <CircleDollarSign size={14} color={theme.colors.emerald[500]} />
                  <Text style={styles.costText}>
                    {trip.estimatedCost.currency} {trip.estimatedCost.totalCost}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={<Compass size={48} color={theme.colors.textMuted} />}
            title="No Completed Trips Yet"
            description="Your logged routes, recorded highway fuel burn, and toll audits will appear here."
            action={
              <Button
                title="Plan Your First Trip"
                variant="primary"
                onPress={() => router.push(routes.plan.index)}
              />
            }
          />
        )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    flexGrow: 1,
  },
  tripCard: {
    marginBottom: theme.spacing.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  corridorName: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  tripMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  metricText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.emerald[500],
    marginLeft: 4,
  },
});
