import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VehicleProfile } from '@know-your-route/contracts';
import { Card, Badge } from '@/shared/ui';
import { theme } from '@/shared/theme';
import { Car, Zap, Fuel, Gauge, ShieldCheck } from 'lucide-react-native';

interface VehicleCardProps {
  vehicle: VehicleProfile;
  isSelected?: boolean;
  onPress?: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  isSelected,
  onPress,
}) => {
  const isEv = vehicle.fuelType === 'EV';
  const fuelPercent = vehicle.currentState?.fuelLevel ?? vehicle.currentState?.batteryLevel ?? 65;
  const range = vehicle.currentState?.rangeKm ?? 400;

  return (
    <Card
      onPress={onPress}
      style={[styles.card, isSelected ? styles.selectedCard : null]}
    >
      <View style={styles.header}>
        <View style={styles.vehicleInfo}>
          <View style={styles.iconCircle}>
            {isEv ? (
              <Zap size={20} color={theme.colors.cyan[500]} />
            ) : (
              <Car size={20} color={theme.colors.brand[400]} />
            )}
          </View>
          <View>
            <Text style={styles.title}>
              {vehicle.make} {vehicle.model}
            </Text>
            <Text style={styles.regNumber}>{vehicle.registrationNumber}</Text>
          </View>
        </View>

        <Badge
          label={vehicle.fuelType}
          variant={isEv ? 'info' : 'primary'}
          size="sm"
        />
      </View>

      {/* Fuel / Battery Bar */}
      <View style={styles.stateSection}>
        <View style={styles.stateRow}>
          <View style={styles.stateItem}>
            {isEv ? (
              <Zap size={14} color={theme.colors.cyan[500]} />
            ) : (
              <Fuel size={14} color={theme.colors.warning} />
            )}
            <Text style={styles.stateLabel}>
              {isEv ? 'Battery' : 'Fuel'}: {fuelPercent}%
            </Text>
          </View>

          <View style={styles.stateItem}>
            <Gauge size={14} color={theme.colors.emerald[500]} />
            <Text style={styles.stateLabel}>Range: ~{range} km</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, Math.max(5, fuelPercent))}%`,
                backgroundColor:
                  fuelPercent < 25
                    ? theme.colors.danger
                    : isEv
                    ? theme.colors.cyan[500]
                    : theme.colors.brand[500],
              },
            ]}
          />
        </View>
      </View>

      {/* Footer Info: Data Source & Efficiency */}
      <View style={styles.footer}>
        <View style={styles.sourceTag}>
          <ShieldCheck size={12} color={theme.colors.textMuted} />
          <Text style={styles.sourceText}>Source: {vehicle.dataSource}</Text>
        </View>
        <Text style={styles.efficiencyText}>
          Avg: {vehicle.efficiency?.estimated ?? 14.5} {vehicle.efficiency?.unit ?? 'km/l'}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  selectedCard: {
    borderColor: theme.colors.brand[500],
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  regNumber: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  stateSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surfaceLight,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  efficiencyText: {
    fontSize: 10,
    color: theme.colors.emerald[500],
    fontWeight: '600',
  },
});
