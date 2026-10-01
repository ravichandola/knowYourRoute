import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Header } from '../../src/components';
import { useAuthStore } from '../../src/stores/auth.store';
import { userApi } from '../../src/api/user';
import { theme } from '../../src/theme';
import { MapPin, Camera, Bell, Check } from 'lucide-react-native';

export default function PermissionsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        await userApi.markOnboarded(user.id);
      }
      updateUser({ isOnboarded: true });
    } catch {
      // Continue even on network hiccup
      updateUser({ isOnboarded: true });
    } finally {
      setLoading(false);
      router.replace('/(tabs)/home');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Permissions" subtitle="Step 3 of 3" />
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>Enable Essential Services</Text>
          <Text style={styles.subtitle}>
            To unlock predictive speed alerts, live traffic recalculations, and cluster OCR.
          </Text>

          <View style={styles.permissionList}>
            <View style={styles.permCard}>
              <View style={styles.iconCircle}>
                <MapPin size={22} color={theme.colors.emerald[500]} />
              </View>
              <View style={styles.permTextWrapper}>
                <Text style={styles.permTitle}>Precise Location</Text>
                <Text style={styles.permDesc}>
                  Calculates real-time expressway progress, speed hazards, and toll plaza arrival.
                </Text>
              </View>
              <Check size={20} color={theme.colors.emerald[500]} />
            </View>

            <View style={styles.permCard}>
              <View style={styles.iconCircle}>
                <Camera size={22} color={theme.colors.cyan[500]} />
              </View>
              <View style={styles.permTextWrapper}>
                <Text style={styles.permTitle}>Camera Access</Text>
                <Text style={styles.permDesc}>
                  Allows scanning your instrument cluster to automatically detect odometer and fuel.
                </Text>
              </View>
              <Check size={20} color={theme.colors.emerald[500]} />
            </View>

            <View style={styles.permCard}>
              <View style={styles.iconCircle}>
                <Bell size={22} color={theme.colors.warning} />
              </View>
              <View style={styles.permTextWrapper}>
                <Text style={styles.permTitle}>Trip Notifications</Text>
                <Text style={styles.permDesc}>
                  Real-time alerts for highway incidents, low FASTag balance, and rest stop approach.
                </Text>
              </View>
              <Check size={20} color={theme.colors.emerald[500]} />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Enable & Launch Dashboard"
            size="lg"
            variant="primary"
            loading={loading}
            onPress={handleComplete}
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
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  permissionList: {
    gap: 12,
  },
  permCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  permTextWrapper: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  permTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  permDesc: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.md,
  },
});
