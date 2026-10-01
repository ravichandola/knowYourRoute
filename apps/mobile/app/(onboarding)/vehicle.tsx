import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Header } from '../../src/components';
import { useRegisterVehicle } from '../../src/features/vehicle/hooks/useVehicles';
import { theme } from '../../src/theme';
import { FuelType } from '@know-your-route/types';

const FUEL_TYPES: { type: FuelType; label: string }[] = [
  { type: 'PETROL', label: 'Petrol' },
  { type: 'DIESEL', label: 'Diesel' },
  { type: 'EV', label: 'Electric (EV)' },
  { type: 'CNG', label: 'CNG' },
];

export default function OnboardingVehicleScreen() {
  const router = useRouter();
  const [make, setMake] = useState('Hyundai');
  const [model, setModel] = useState('Creta');
  const [regNumber, setRegNumber] = useState('MH 02 FZ 4821');
  const [fuelType, setFuelType] = useState<FuelType>('PETROL');
  const [tankCapacity, setTankCapacity] = useState('50');

  const registerMutation = useRegisterVehicle();

  const handleSaveVehicle = () => {
    registerMutation.mutate(
      {
        make,
        model,
        registrationNumber: regNumber,
        fuelType,
        tankCapacity: Number(tankCapacity) || (fuelType === 'EV' ? 60 : 45),
        dataSource: 'USER_CONFIRMED',
      },
      {
        onSuccess: () => {
          router.push('/(onboarding)/permissions');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Add Your Vehicle" subtitle="Step 2 of 3" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Vehicle Details</Text>
        <Text style={styles.sectionDesc}>
          Route intelligence calculates real-time energy usage and stop recommendations based on your vehicle.
        </Text>

        <View style={styles.form}>
          <Input
            label="Make (Brand)"
            placeholder="e.g. Hyundai, Tata, Maruti"
            value={make}
            onChangeText={setMake}
          />

          <Input
            label="Model"
            placeholder="e.g. Creta, Nexon EV, City"
            value={model}
            onChangeText={setModel}
          />

          <Input
            label="Registration Number"
            placeholder="e.g. MH 02 FZ 4821"
            value={regNumber}
            onChangeText={setRegNumber}
            autoCapitalize="characters"
          />

          <Text style={styles.inputLabel}>Fuel / Powertrain Type</Text>
          <View style={styles.fuelGrid}>
            {FUEL_TYPES.map((item) => (
              <TouchableOpacity
                key={item.type}
                activeOpacity={0.8}
                onPress={() => setFuelType(item.type)}
                style={[
                  styles.fuelOption,
                  fuelType === item.type ? styles.fuelOptionActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.fuelOptionText,
                    fuelType === item.type ? styles.fuelOptionTextActive : null,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label={fuelType === 'EV' ? 'Battery Capacity (kWh)' : 'Fuel Tank Capacity (L)'}
            placeholder={fuelType === 'EV' ? '60' : '45'}
            value={tankCapacity}
            onChangeText={setTankCapacity}
            keyboardType="numeric"
            containerStyle={{ marginTop: theme.spacing.md }}
          />

          <Button
            title="Save Vehicle & Proceed"
            size="lg"
            variant="primary"
            loading={registerMutation.isPending}
            onPress={handleSaveVehicle}
            style={styles.submitBtn}
          />
        </View>
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
    padding: theme.spacing.xl,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  sectionDesc: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  inputLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs + 2,
  },
  fuelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  fuelOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
  },
  fuelOptionActive: {
    borderColor: theme.colors.brand[500],
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  fuelOptionText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  fuelOptionTextActive: {
    color: theme.colors.brand[400],
  },
  submitBtn: {
    marginTop: theme.spacing.xl,
  },
});
