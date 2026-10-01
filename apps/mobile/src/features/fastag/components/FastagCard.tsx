import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FastagContext } from '@know-your-route/types';
import { Card, Badge } from '../../../components';
import { theme } from '../../../theme';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react-native';

interface FastagCardProps {
  fastag: FastagContext;
  tollCost?: number;
}

export const FastagCard: React.FC<FastagCardProps> = ({ fastag, tollCost }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <CreditCard size={20} color={theme.colors.emerald[500]} />
          <Text style={styles.title}>FASTag Status</Text>
        </View>
        <Badge
          label={fastag.isBalanceSufficientForTrip ? 'SUFFICIENT' : 'LOW BALANCE'}
          variant={fastag.isBalanceSufficientForTrip ? 'success' : 'danger'}
        />
      </View>

      <View style={styles.balanceSection}>
        <View>
          <Text style={styles.bankName}>{fastag.bankName}</Text>
          <Text style={styles.tagId}>{fastag.tagId}</Text>
        </View>
        <View style={styles.balanceWrapper}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceValue}>
            {fastag.currency} {fastag.currentBalance}
          </Text>
        </View>
      </View>

      {tollCost !== undefined && (
        <View style={styles.sufficiencyRow}>
          {fastag.isBalanceSufficientForTrip ? (
            <View style={styles.statusIndicator}>
              <CheckCircle size={14} color={theme.colors.emerald[500]} />
              <Text style={styles.statusText}>
                Covers estimated toll of {fastag.currency} {tollCost}
              </Text>
            </View>
          ) : (
            <View style={styles.statusIndicator}>
              <AlertCircle size={14} color={theme.colors.danger} />
              <Text style={[styles.statusText, { color: theme.colors.danger }]}>
                Shortfall of {fastag.currency} {fastag.shortfallAmount || tollCost - fastag.currentBalance}. Recharge recommended.
              </Text>
            </View>
          )}
        </View>
      )}
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
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  bankName: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  tagId: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  balanceWrapper: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.emerald[500],
  },
  sufficiencyRow: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
});
