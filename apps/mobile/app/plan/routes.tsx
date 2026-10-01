import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header, Button } from '../../src/components';
import { MapViewAdapter } from '../../src/features/map/MapViewAdapter';
import { RouteCard } from '../../src/features/routeDiscovery/components/RouteCard';
import { useRouteStore } from '../../src/stores/route.store';
import { RouteProfile } from '@know-your-route/types';
import { theme } from '../../src/theme';
import { ArrowRight } from 'lucide-react-native';

export default function RoutesComparisonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routesData?: string }>();
  const { origin, destination, selectedRoute, setSelectedRoute } = useRouteStore();

  const routes: RouteProfile[] = params.routesData
    ? JSON.parse(params.routesData)
    : [];

  const activeRoute = selectedRoute || routes[0];

  const handleSelect = (route: RouteProfile) => {
    setSelectedRoute(route);
  };

  const handleInspectDetails = () => {
    if (!activeRoute) return;
    router.push({
      pathname: '/plan/route-detail',
      params: { routeJson: JSON.stringify(activeRoute) },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Candidate Corridors"
        subtitle={`${origin?.name || 'Origin'} ➔ ${destination?.name || 'Destination'}`}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Isolated Map Overview */}
        <MapViewAdapter
          route={activeRoute}
          origin={origin}
          destination={destination}
          style={styles.map}
        />

        <View style={styles.headerSection}>
          <Text style={styles.title}>Evaluated Routes ({routes.length})</Text>
          <Text style={styles.subtitle}>
            Enriched with real-world toll costs, safety hazard scores & fuel consumption.
          </Text>
        </View>

        {/* Route Cards */}
        {routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            isSelected={activeRoute?.id === route.id}
            onPress={() => handleSelect(route)}
          />
        ))}

        <Button
          title="Inspect Route Intelligence & AI Insights"
          size="lg"
          variant="primary"
          icon={<ArrowRight size={18} color={theme.colors.white} />}
          onPress={handleInspectDetails}
          style={styles.actionBtn}
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
  map: {
    marginBottom: theme.spacing.md,
  },
  headerSection: {
    marginVertical: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: theme.spacing.sm,
  },
  actionBtn: {
    marginTop: theme.spacing.md,
  },
});
