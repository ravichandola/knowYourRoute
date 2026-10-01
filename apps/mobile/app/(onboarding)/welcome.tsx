import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components';
import { theme } from '../../src/theme';
import { Compass, Car, Zap, CheckCircle2 } from 'lucide-react-native';

export default function WelcomeOnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Compass size={36} color={theme.colors.emerald[500]} />
          </View>
          <Text style={styles.title}>Trip Intelligence Tailored to You</Text>
          <Text style={styles.subtitle}>
            Unlike generic GPS apps, Know Your Route factors in your vehicle's exact range,
            fuel efficiency, FASTag toll costs, weather risks, and roadside stops.
          </Text>
        </View>

        <View style={styles.cardsList}>
          <View style={styles.stepCard}>
            <Car size={24} color={theme.colors.brand[400]} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>1. Register Your Vehicle</Text>
              <Text style={styles.stepDesc}>
                Add your car or EV to get tailored fuel/charging calculations.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <Zap size={24} color={theme.colors.cyan[500]} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>2. Instrument Cluster Snapshots</Text>
              <Text style={styles.stepDesc}>
                Snap your dashboard or link your connected car to auto-read fuel & odometer.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <CheckCircle2 size={24} color={theme.colors.emerald[500]} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>3. Compare Predictive Routes</Text>
              <Text style={styles.stepDesc}>
                Receive 2-3 validated candidate corridors with toll, safety, and road quality ratings.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue to Vehicle Setup"
            size="lg"
            variant="primary"
            onPress={() => router.push('/(onboarding)/vehicle')}
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
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 22,
  },
  cardsList: {
    marginVertical: theme.spacing['2xl'],
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.md,
  },
  stepContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepDesc: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.md,
  },
});
