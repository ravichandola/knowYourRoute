import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Header, Card, Badge, Button, DevBadge } from '../../src/components';
import { useAuthStore } from '../../src/stores/auth.store';
import { theme } from '../../src/theme';
import { User, CreditCard, Sliders, LogOut, Shield } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Driver Profile" subtitle="Account & Intelligence Preferences" showBack={false} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.devRow}>
          <DevBadge />
        </View>

        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <User size={28} color={theme.colors.emerald[500]} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Alex Rivera'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'driver@example.com'}</Text>
            <Badge label="PRO DRIVER" variant="primary" size="sm" style={{ marginTop: 4 }} />
          </View>
        </Card>

        {/* FASTag Account */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={theme.colors.emerald[500]} />
            <Text style={styles.sectionTitle}>Connected FASTag</Text>
          </View>
          <View style={styles.fastagRow}>
            <View>
              <Text style={styles.bankName}>ICICI Bank NETC FASTag</Text>
              <Text style={styles.tagId}>FT-88392019-ICICI</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.balanceVal}>₹750</Text>
              <Text style={styles.balanceSub}>Active Balance</Text>
            </View>
          </View>
        </Card>

        {/* Driving Preferences */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Sliders size={20} color={theme.colors.brand[400]} />
            <Text style={styles.sectionTitle}>Routing Preferences</Text>
          </View>

          <View style={styles.prefItem}>
            <Text style={styles.prefText}>Preferred Stop Interval</Text>
            <Text style={styles.prefVal}>Every 150 km</Text>
          </View>

          <View style={styles.prefItem}>
            <Text style={styles.prefText}>Driving Style</Text>
            <Text style={styles.prefVal}>Balanced</Text>
          </View>

          <View style={styles.prefItem}>
            <Text style={styles.prefText}>Toll Avoidance</Text>
            <Text style={styles.prefVal}>Disabled (Expressway Priority)</Text>
          </View>
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          variant="outline"
          icon={<LogOut size={16} color={theme.colors.danger} />}
          textStyle={{ color: theme.colors.danger }}
          onPress={handleLogout}
          style={styles.logoutBtn}
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
  devRow: {
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  userEmail: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  fastagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  bankName: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  tagId: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  balanceVal: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '800',
    color: theme.colors.emerald[500],
  },
  balanceSub: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  prefItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  prefText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  prefVal: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  logoutBtn: {
    marginTop: theme.spacing.lg,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
});
