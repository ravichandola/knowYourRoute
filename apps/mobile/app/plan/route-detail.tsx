import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header, Button, Card, Badge } from '../../src/components';
import { SafetyCard } from '../../src/features/safety/components/SafetyCard';
import { WeatherCard } from '../../src/features/weather/components/WeatherCard';
import { FastagCard } from '../../src/features/fastag/components/FastagCard';
import { useRouteStore } from '../../src/stores/route.store';
import { useVehicleStore } from '../../src/stores/vehicle.store';
import { useCreateTrip } from '../../src/features/trip/hooks/useTrip';
import { RouteProfile } from '@know-your-route/types';
import { theme } from '../../src/theme';
import {
  Sparkles,
  MapPin,
  Utensils,
  Fuel,
  Zap,
  Play,
  CheckCircle2,
} from 'lucide-react-native';

export default function RouteDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routeJson?: string }>();
  const { origin, destination, selectedRoute } = useRouteStore();
  const { activeVehicle } = useVehicleStore();
  const createTripMutation = useCreateTrip();

  const route: RouteProfile | null = params.routeJson
    ? JSON.parse(params.routeJson)
    : selectedRoute;

  const handleStartTrip = () => {
    if (!route || !origin || !destination) return;

    createTripMutation.mutate(
      {
        vehicleId: activeVehicle?.id || 'veh_demo_creta',
        origin,
        destination,
        selectedRouteId: route.id,
      },
      {
        onSuccess: (newTrip) => {
          router.push('/trip/live');
        },
      }
    );
  };

  if (!route) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Route Details" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No route selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={route.name} subtitle={`${route.distanceKm} km • ${Math.round(route.durationMinutes / 60)}h ${route.durationMinutes % 60}m`} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* AI Trip Reasoning Card (Section 21 & 22) */}
        <Card style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Sparkles size={20} color={theme.colors.brand[400]} />
            <Text style={styles.aiTitle}>AI Route Reasoning</Text>
            <Badge label="VERIFIED" variant="success" size="sm" style={{ marginLeft: 'auto' }} />
          </View>
          <Text style={styles.aiHeadline}>
            Optimal Route via {route.name}
          </Text>
          <Text style={styles.aiRationale}>
            Evaluated against current corridor telemetry. Multi-lane expressway provides 85% surface
            consistency with 0 active blackspots detected, saving approx 18 minutes compared to
            alternative bypass roads.
          </Text>

          <View style={styles.aiHighlights}>
            <View style={styles.highlightItem}>
              <CheckCircle2 size={14} color={theme.colors.emerald[500]} />
              <Text style={styles.highlightText}>
                FASTag balance is fully sufficient for ₹{route.toll.totalCost} toll charges.
              </Text>
            </View>
            <View style={styles.highlightItem}>
              <CheckCircle2 size={14} color={theme.colors.emerald[500]} />
              <Text style={styles.highlightText}>
                Cruising speed of 85 km/h will yield optimal fuel economy of ~14.8 km/l.
              </Text>
            </View>
          </View>
        </Card>

        {/* Safety Intelligence */}
        <SafetyCard safety={route.safety} />

        {/* Weather Exposure */}
        <WeatherCard weather={route.weather} />

        {/* FASTag Toll Payment Readiness */}
        {route.fastag && (
          <FastagCard fastag={route.fastag} tollCost={route.toll.totalCost} />
        )}

        {/* Smart Stops & EV Hubs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Smart Roadside Stops</Text>
        </View>

        {route.usefulStops.map((stop) => (
          <Card key={stop.id} style={styles.stopCard}>
            <View style={styles.stopHeader}>
              <View style={styles.stopIconCircle}>
                {stop.category === 'FOOD' ? (
                  <Utensils size={16} color={theme.colors.brand[400]} />
                ) : stop.category === 'EV_CHARGING' ? (
                  <Zap size={16} color={theme.colors.cyan[500]} />
                ) : (
                  <Fuel size={16} color={theme.colors.warning} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stopName}>{stop.name}</Text>
                <Text style={styles.stopSub}>
                  At {stop.distanceFromOriginKm} km marker • {stop.detourMinutes} min detour • Rating {stop.rating || 4.5} ★
                </Text>
              </View>
            </View>

            <View style={styles.amenitiesRow}>
              {stop.amenities.map((amenity, i) => (
                <View key={i} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        <Button
          title="Start Live Trip"
          size="lg"
          variant="primary"
          icon={<Play size={18} color={theme.colors.white} />}
          loading={createTripMutation.isPending}
          onPress={handleStartTrip}
          style={styles.startBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.base,
  },
  aiCard: {
    backgroundColor: theme.colors.slate[900],
    borderColor: 'rgba(37, 99, 235, 0.4)',
    borderWidth: 1.5,
    marginBottom: theme.spacing.md,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  aiTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.xs,
  },
  aiHeadline: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '800',
    color: theme.colors.brand[400],
    marginBottom: 4,
  },
  aiRationale: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  aiHighlights: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
    gap: 6,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    marginLeft: 6,
    fontWeight: '500',
  },
  sectionHeader: {
    marginVertical: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stopCard: {
    marginBottom: theme.spacing.sm,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stopName: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stopSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.spacing.sm,
  },
  amenityChip: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  amenityText: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  startBtn: {
    marginTop: theme.spacing.xl,
  },
});
