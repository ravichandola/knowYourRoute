import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Header, Input, Button, Card } from '@/shared/ui';
import { useRouteStore } from '../store/route.store';
import { useVehicleStore } from '@/features/vehicles';
import { useVehicles } from '@/features/vehicles';
import { usePlanRoute } from '../hooks/useRoutePlanning';
import { theme } from '@/shared/theme';
import { MapPin, Navigation, Car, Sliders, ArrowUpDown } from 'lucide-react-native';

export default function PlanIndexScreen() {
  const router = useRouter();
  const { origin, destination, setOrigin, setDestination } = useRouteStore();
  const { activeVehicle } = useVehicleStore();
  const { data: vehicles } = useVehicles();

  const [originText, setOriginText] = useState(origin?.name || 'Mumbai Central');
  const [destText, setDestText] = useState(destination?.name || 'Pune Shivaji Nagar');
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [avoidHighways, setAvoidHighways] = useState(false);

  const planRouteMutation = usePlanRoute();
  const vehicle = activeVehicle || (vehicles && vehicles[0]);

  const handleSwap = () => {
    const temp = originText;
    setOriginText(destText);
    setDestText(temp);

    const tempOrig = origin;
    setOrigin(destination);
    setDestination(tempOrig);
  };

  const handleDiscover = () => {
    const originLocation = origin?.location || { latitude: 18.9696, longitude: 72.8193 };
    const destLocation = destination?.location || { latitude: 18.5314, longitude: 73.8446 };

    setOrigin({ name: originText, location: originLocation });
    setDestination({ name: destText, location: destLocation });

    planRouteMutation.mutate(
      {
        origin: { name: originText, location: originLocation },
        destination: { name: destText, location: destLocation },
        vehicleId: vehicle?.id,
        preferences: {
          avoidTolls,
          avoidHighways,
        },
      },
      {
        onSuccess: (data) => {
          router.push({
            pathname: '/plan/routes',
            params: { routesData: JSON.stringify(data.routes) },
          });
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Plan Route" subtitle="Configure points & preferences" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Origin & Destination Inputs with Swap */}
        <Card style={styles.inputCard}>
          <View style={styles.inputRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.emerald[500] }]} />
            <View style={{ flex: 1 }}>
              <Input
                label="Departure Location"
                value={originText}
                onChangeText={setOriginText}
                containerStyle={{ marginBottom: 0 }}
                placeholder="Where from?"
              />
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.7} onPress={handleSwap} style={styles.swapBtn}>
            <ArrowUpDown size={18} color={theme.colors.brand[400]} />
          </TouchableOpacity>

          <View style={styles.inputRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.danger }]} />
            <View style={{ flex: 1 }}>
              <Input
                label="Destination"
                value={destText}
                onChangeText={setDestText}
                containerStyle={{ marginBottom: 0 }}
                placeholder="Where to?"
              />
            </View>
          </View>
        </Card>

        {/* Selected Vehicle Context */}
        <Card style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <Car size={18} color={theme.colors.brand[400]} />
            <Text style={styles.vehicleTitle}>Selected Vehicle</Text>
          </View>
          <Text style={styles.vehicleName}>
            {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.fuelType})` : 'Standard Petrol Sedan'}
          </Text>
          <Text style={styles.vehicleSub}>
            Efficiency & battery/fuel consumption tailored to this car profile.
          </Text>
        </Card>

        {/* Trip Preferences */}
        <Card style={styles.prefCard}>
          <View style={styles.prefHeader}>
            <Sliders size={18} color={theme.colors.brand[400]} />
            <Text style={styles.prefTitle}>Route Filters</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAvoidTolls(!avoidTolls)}
            style={styles.toggleRow}
          >
            <Text style={styles.toggleLabel}>Avoid Toll Roads</Text>
            <View style={[styles.toggleCheckbox, avoidTolls ? styles.checkboxActive : null]}>
              {avoidTolls && <View style={styles.checkboxInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAvoidHighways(!avoidHighways)}
            style={styles.toggleRow}
          >
            <Text style={styles.toggleLabel}>Avoid Expressways</Text>
            <View style={[styles.toggleCheckbox, avoidHighways ? styles.checkboxActive : null]}>
              {avoidHighways && <View style={styles.checkboxInner} />}
            </View>
          </TouchableOpacity>
        </Card>

        <Button
          title="Discover Optimal Routes"
          size="lg"
          variant="primary"
          icon={<Navigation size={18} color={theme.colors.white} />}
          loading={planRouteMutation.isPending}
          onPress={handleDiscover}
          style={styles.discoverBtn}
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
    flexGrow: 1,
  },
  inputCard: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.md,
    marginTop: 18,
  },
  swapBtn: {
    alignSelf: 'flex-end',
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.radius.full,
    marginVertical: 4,
    marginRight: 4,
  },
  vehicleCard: {
    marginBottom: theme.spacing.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.xs,
  },
  vehicleName: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.emerald[500],
    marginTop: 6,
  },
  vehicleSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  prefCard: {
    marginBottom: theme.spacing.xl,
  },
  prefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  prefTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  toggleLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  toggleCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: theme.colors.brand[500],
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: theme.colors.brand[500],
  },
  discoverBtn: {
    marginTop: theme.spacing.sm,
  },
});
