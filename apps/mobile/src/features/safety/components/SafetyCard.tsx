import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafetyContext } from '@know-your-route/types';
import { Card, Badge } from '../../../components';
import { theme } from '../../../theme';
import { Shield, AlertTriangle, Moon } from 'lucide-react-native';

interface SafetyCardProps {
  safety: SafetyContext;
}

export const SafetyCard: React.FC<SafetyCardProps> = ({ safety }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Shield size={20} color={theme.colors.brand[400]} />
          <Text style={styles.title}>Safety Intelligence</Text>
        </View>
        <Badge
          label={`SCORE ${safety.overallScore}/100`}
          variant={safety.rating === 'HIGH' ? 'success' : 'warning'}
        />
      </View>

      <Text style={styles.summary}>{safety.summary}</Text>

      <View style={styles.factorsRow}>
        <View style={styles.factorItem}>
          <Moon size={14} color={theme.colors.textSecondary} />
          <Text style={styles.factorText}>
            Night Risk: <Text style={styles.boldText}>{safety.nightDrivingRisk}</Text>
          </Text>
        </View>

        <View style={styles.factorItem}>
          <AlertTriangle size={14} color={theme.colors.warning} />
          <Text style={styles.factorText}>
            Blackspots: <Text style={styles.boldText}>{safety.knownIncidents.length}</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  summary: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    lineHeight: 18,
  },
  factorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  factorText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  boldText: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
