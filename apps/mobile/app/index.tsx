import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/auth.store';
import { Button, DevBadge } from '../src/components';
import { theme } from '../src/theme';
import { Navigation2, ShieldCheck, Zap, Fuel } from 'lucide-react-native';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // If user is already authenticated in session, route directly
    if (isAuthenticated) {
      if (user?.isOnboarded) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(onboarding)/welcome');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <DevBadge />
        </View>

        {/* Hero Branding */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Navigation2 size={42} color={theme.colors.emerald[500]} />
          </View>
          <Text style={styles.brandTitle}>KNOW YOUR ROUTE</Text>
          <Text style={styles.brandTagline}>
            Predictive Route, Vehicle & Trip Safety Intelligence
          </Text>
        </View>

        {/* Value Prop Badges */}
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <ShieldCheck size={20} color={theme.colors.emerald[500]} />
            <Text style={styles.featureText}>Safety & Hazard Scores</Text>
          </View>
          <View style={styles.featureItem}>
            <Fuel size={20} color={theme.colors.warning} />
            <Text style={styles.featureText}>Toll & Energy Estimation</Text>
          </View>
          <View style={styles.featureItem}>
            <Zap size={20} color={theme.colors.cyan[500]} />
            <Text style={styles.featureText}>Vehicle Telemetry / Snapshot</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Get Started"
            size="lg"
            variant="primary"
            onPress={() => router.push('/(auth)/signup')}
            style={styles.primaryButton}
          />
          <Button
            title="I have an account • Sign In"
            size="lg"
            variant="outline"
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.xl,
  },
  topRow: {
    paddingTop: theme.spacing.md,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: theme.spacing['2xl'],
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  brandTitle: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    lineHeight: 22,
  },
  featureGrid: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginVertical: theme.spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  featureText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '600',
    marginLeft: theme.spacing.md,
  },
  actions: {
    width: '100%',
  },
  primaryButton: {
    marginBottom: theme.spacing.md,
  },
});
