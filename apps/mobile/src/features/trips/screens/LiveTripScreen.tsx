import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { routes } from '@/shared/navigation';
import { Screen } from '@/shared/layout';
import { Button, Card, Badge } from '@/shared/ui';
import { MapViewAdapter } from '@/shared/map/MapViewAdapter';
import { useActiveTripStore } from '../store/active-trip.store';
import { LiveTripEvent } from '@know-your-route/contracts';
import { theme } from '@/shared/theme';
import {
  Navigation,
  X,
  AlertTriangle,
  Radio,
  Coffee,
  Fuel,
  Volume2,
  VolumeX,
} from 'lucide-react-native';

export default function LiveTripHUDScreen() {
  const router = useRouter();
  const activeTrip = useActiveTripStore((s) => s.activeTrip);
  const origin = activeTrip?.origin ?? null;
  const destination = activeTrip?.destination ?? null;
  const selectedRoute = activeTrip?.route ?? null;

  const [currentSpeed, setCurrentSpeed] = useState(84);
  const [distanceRemaining, setDistanceRemaining] = useState(selectedRoute?.distanceKm || 148);
  const [muted, setMuted] = useState(false);
  const [liveEvents, setLiveEvents] = useState<LiveTripEvent[]>([
    {
      id: 'evt_1',
      tripId: 'live_trip',
      type: 'TRAFFIC_CHANGED',
      severity: 'INFO',
      message: 'Expressway clear ahead. Flowing at 85 km/h.',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'evt_2',
      tripId: 'live_trip',
      type: 'STOP_RECOMMENDED',
      severity: 'INFO',
      message: 'HPCL AutoCare & EV Fast Hub approaching in 24 km.',
      timestamp: new Date().toISOString(),
    },
  ]);

  // Simulate periodic live telemetry update (Section 29)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSpeed((s) => Math.max(75, Math.min(95, s + (Math.random() > 0.5 ? 2 : -2))));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Screen
      header={
        <View style={styles.hudTopBar}>
        <View style={styles.liveIndicator}>
          <Radio size={16} color={theme.colors.emerald[500]} />
          <Text style={styles.liveText}>LIVE INTELLIGENCE</Text>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setMuted(!muted)}
          >
            {muted ? (
              <VolumeX size={18} color={theme.colors.textSecondary} />
            ) : (
              <Volume2 size={18} color={theme.colors.brand[400]} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
          >
            <X size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
        </View>
      }
      contentContainerStyle={styles.container}
    >
        {/* Isolated Map View */}
        <MapViewAdapter
          route={selectedRoute}
          origin={origin}
          destination={destination}
          style={styles.map}
        />

        {/* Speedometer & Cruising Efficiency Card */}
        <Card style={styles.speedCard}>
          <View style={styles.speedRow}>
            <View>
              <Text style={styles.speedLabel}>CURRENT SPEED</Text>
              <View style={styles.speedNumberWrapper}>
                <Text style={styles.speedNumber}>{currentSpeed}</Text>
                <Text style={styles.speedUnit}>KM/H</Text>
              </View>
            </View>

            <View style={styles.rangeCol}>
              <Text style={styles.rangeLabel}>DISTANCE LEFT</Text>
              <Text style={styles.rangeVal}>{distanceRemaining} km</Text>
              <Badge
                label="OPTIMAL CRUISE"
                variant="success"
                size="sm"
                style={{ marginTop: 6 }}
              />
            </View>
          </View>
        </Card>

        {/* Live Trip Events Stream (Section 29) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Corridor Feed</Text>
        </View>

        {liveEvents.map((evt) => (
          <Card key={evt.id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.eventIcon}>
                {evt.type === 'STOP_RECOMMENDED' ? (
                  <Coffee size={16} color={theme.colors.cyan[500]} />
                ) : (
                  <Navigation size={16} color={theme.colors.emerald[500]} />
                )}
              </View>
              <Text style={styles.eventTitle}>{evt.type.replace(/_/g, ' ')}</Text>
              <Text style={styles.eventTime}>Just now</Text>
            </View>
            <Text style={styles.eventMessage}>{evt.message}</Text>
          </Card>
        ))}

        <Button
          title="Exit Trip HUD"
          variant="outline"
          onPress={() => router.replace(routes.tabs.home)}
          style={styles.exitBtn}
        />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hudTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.emerald[500],
    marginLeft: 6,
    letterSpacing: 0.8,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  container: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },
  map: {
    marginBottom: theme.spacing.md,
  },
  speedCard: {
    backgroundColor: theme.colors.slate[900],
    borderWidth: 1.5,
    borderColor: theme.colors.brand[500],
    marginBottom: theme.spacing.md,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  speedNumberWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  speedNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.textPrimary,
  },
  speedUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.brand[400],
    marginLeft: 6,
  },
  rangeCol: {
    alignItems: 'flex-end',
  },
  rangeLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  rangeVal: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  sectionHeader: {
    marginVertical: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  eventCard: {
    marginBottom: theme.spacing.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventIcon: {
    marginRight: 6,
  },
  eventTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  eventTime: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginLeft: 'auto',
  },
  eventMessage: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  exitBtn: {
    marginTop: theme.spacing.xl,
  },
});
