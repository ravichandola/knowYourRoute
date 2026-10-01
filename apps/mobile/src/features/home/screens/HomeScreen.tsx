import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { useVehicleStore } from '@/features/vehicles';
import { useVehicles } from '@/features/vehicles';
import { useRouteStore } from '@/features/route-planning';
import { Button, Card, DevBadge, Badge } from '@/shared/ui';
import { VehicleCard } from '@/features/vehicles';
import { theme } from '@/shared/theme';
import {
  Navigation,
  Compass,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  CloudSun,
  MapPin,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const activeVehicle = useVehicleStore((s) => s.activeVehicle);
  const { data: vehicles } = useVehicles();
  const { origin, destination, setOrigin, setDestination } = useRouteStore();

  const currentVehicle = activeVehicle || (vehicles && vehicles[0]);

  const handleQuickRoute = (
    fromName: string,
    fromLat: number,
    fromLng: number,
    toName: string,
    toLat: number,
    toLng: number
  ) => {
    setOrigin({ name: fromName, location: { latitude: fromLat, longitude: fromLng } });
    setDestination({ name: toName, location: { latitude: toLat, longitude: toLng } });
    router.push('/plan');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>Hello, {user?.name || 'Driver'}</Text>
            <Text style={styles.subtitleText}>Where are we driving today?</Text>
          </View>
          <DevBadge />
        </View>

        {/* Plan Route Hero Card */}
        <Card style={styles.planCard}>
          <View style={styles.planCardHeader}>
            <View style={styles.planIconWrapper}>
              <Navigation size={22} color={theme.colors.emerald[500]} />
            </View>
            <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
              <Text style={styles.planCardTitle}>Plan My Route</Text>
              <Text style={styles.planCardSubtitle}>
                Calculate fuel, toll, road hazard & stop intelligence
              </Text>
            </View>
          </View>

          {/* Location Summary Inputs */}
          <View style={styles.routeInputs}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/plan')}
              style={styles.locationField}
            >
              <View style={[styles.dot, { backgroundColor: theme.colors.emerald[500] }]} />
              <Text style={styles.locationText} numberOfLines={1}>
                {origin?.name || 'Current Location'}
              </Text>
            </TouchableOpacity>

            <View style={styles.connectorLine} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/plan')}
              style={styles.locationField}
            >
              <View style={[styles.dot, { backgroundColor: theme.colors.danger }]} />
              <Text style={styles.locationText} numberOfLines={1}>
                {destination?.name || 'Enter destination...'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Discover Optimal Corridors"
            size="md"
            variant="primary"
            icon={<Compass size={18} color={theme.colors.white} />}
            onPress={() => router.push('/plan')}
            style={styles.discoverBtn}
          />
        </Card>

        {/* Active Vehicle Status */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Vehicle</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/vehicle')}>
            <Text style={styles.seeAllText}>Manage</Text>
          </TouchableOpacity>
        </View>

        {currentVehicle ? (
          <VehicleCard
            vehicle={currentVehicle}
            onPress={() => router.push('/(tabs)/vehicle')}
          />
        ) : (
          <Card style={styles.addVehicleCard} onPress={() => router.push('/(onboarding)/vehicle')}>
            <Text style={styles.addVehicleTitle}>+ Register Vehicle</Text>
            <Text style={styles.addVehicleSub}>Add your car to unlock energy intelligence</Text>
          </Card>
        )}

        {/* Quick Intelligence Summary Bar */}
        <View style={styles.intelGrid}>
          <Card style={styles.intelCard}>
            <CreditCard size={18} color={theme.colors.emerald[500]} />
            <Text style={styles.intelValue}>₹750</Text>
            <Text style={styles.intelLabel}>FASTag Balance</Text>
            <Badge label="ACTIVE" variant="success" size="sm" style={{ marginTop: 4 }} />
          </Card>

          <Card style={styles.intelCard}>
            <ShieldCheck size={18} color={theme.colors.brand[400]} />
            <Text style={styles.intelValue}>92%</Text>
            <Text style={styles.intelLabel}>Safety Index</Text>
            <Badge label="HIGH" variant="primary" size="sm" style={{ marginTop: 4 }} />
          </Card>

          <Card style={styles.intelCard}>
            <CloudSun size={18} color={theme.colors.cyan[500]} />
            <Text style={styles.intelValue}>29°C</Text>
            <Text style={styles.intelLabel}>Corridor Weather</Text>
            <Badge label="CLEAR" variant="info" size="sm" style={{ marginTop: 4 }} />
          </Card>
        </View>

        {/* Popular Inter-City Corridors */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Routes</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            handleQuickRoute(
              'Mumbai Bandra',
              19.0596,
              72.8295,
              'Pune Shivaji Nagar',
              18.5314,
              73.8446
            )
          }
        >
          <Card style={styles.corridorCard}>
            <View style={styles.corridorRow}>
              <View>
                <Text style={styles.corridorTitle}>Mumbai ➔ Pune</Text>
                <Text style={styles.corridorSub}>Via Mumbai-Pune Expressway (148 km • 2h 45m)</Text>
              </View>
              <ArrowRight size={18} color={theme.colors.brand[400]} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            handleQuickRoute(
              'Delhi Connaught Place',
              28.6328,
              77.2197,
              'Agra Tajganj',
              27.1751,
              78.0421
            )
          }
        >
          <Card style={styles.corridorCard}>
            <View style={styles.corridorRow}>
              <View>
                <Text style={styles.corridorTitle}>Delhi ➔ Agra</Text>
                <Text style={styles.corridorSub}>Via Yamuna Expressway (235 km • 3h 30m)</Text>
              </View>
              <ArrowRight size={18} color={theme.colors.brand[400]} />
            </View>
          </Card>
        </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  greetingText: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subtitleText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  planCard: {
    backgroundColor: theme.colors.slate[900],
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    marginBottom: theme.spacing.xl,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  planIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCardTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  planCardSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  routeInputs: {
    backgroundColor: theme.colors.slate[950],
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.md,
  },
  locationField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  connectorLine: {
    width: 2,
    height: 14,
    backgroundColor: theme.colors.surfaceBorder,
    marginLeft: 4,
    marginVertical: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.md,
  },
  locationText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '600',
  },
  discoverBtn: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  seeAllText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.brand[400],
    fontWeight: '600',
  },
  addVehicleCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderStyle: 'dashed',
    marginBottom: theme.spacing.md,
  },
  addVehicleTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.brand[400],
  },
  addVehicleSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  intelGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: theme.spacing.sm,
  },
  intelCard: {
    flex: 1,
    padding: theme.spacing.sm + 2,
    alignItems: 'center',
  },
  intelValue: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  intelLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  corridorCard: {
    marginBottom: theme.spacing.sm,
  },
  corridorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  corridorTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  corridorSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
