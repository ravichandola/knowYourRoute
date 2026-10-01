import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Header, DevBadge } from '@/shared/ui';
import { useLogin } from '../hooks/useAuth';
import { theme } from '@/shared/theme';
import { Mail, Lock, Sparkles } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@knowyourroute.com');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');

  const loginMutation = useLogin();

  const handleLogin = () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setErrorMsg('');
    loginMutation.mutate(
      { email, password },
      {
        onError: (err: any) => {
          setErrorMsg(err.message || 'Login failed. Please check credentials.');
        },
      }
    );
  };

  const handleQuickDemo = () => {
    setEmail('demo@knowyourroute.com');
    setPassword('password123');
    loginMutation.mutate({
      email: 'demo@knowyourroute.com',
      password: 'password123',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Sign In" subtitle="Access your vehicle & route intelligence" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.devRow}>
          <DevBadge />
        </View>

        <Text style={styles.heading}>Welcome Back</Text>
        <Text style={styles.subheading}>
          Sign in to view your real-time vehicle status and plan intelligent trips.
        </Text>

        {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="driver@example.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errorMsg) setErrorMsg('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={theme.colors.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={18} color={theme.colors.textMuted} />}
          />

          <Button
            title="Sign In"
            size="lg"
            variant="primary"
            loading={loginMutation.isPending}
            onPress={handleLogin}
            style={styles.submitBtn}
          />

          {/* Quick Demo Login Option for Instant Testing */}
          <Button
            title="One-Tap Demo Sign In"
            size="md"
            variant="secondary"
            icon={<Sparkles size={16} color={theme.colors.brand[400]} />}
            loading={loginMutation.isPending}
            onPress={handleQuickDemo}
            style={styles.demoBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.linkText}>Create Account</Text>
          </TouchableOpacity>
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
  devRow: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  heading: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subheading: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: theme.colors.danger,
    borderWidth: 1,
    color: theme.colors.danger,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    fontSize: theme.typography.fontSizes.xs,
    marginBottom: theme.spacing.md,
  },
  form: {
    marginTop: theme.spacing.sm,
  },
  submitBtn: {
    marginTop: theme.spacing.md,
  },
  demoBtn: {
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
  },
  linkText: {
    color: theme.colors.brand[400],
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '700',
  },
});
