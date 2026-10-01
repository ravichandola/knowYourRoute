import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Header } from '../../src/components';
import { useSignup } from '../../src/features/auth/hooks/useAuth';
import { theme } from '../../src/theme';
import { Mail, Lock, User, Phone } from 'lucide-react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const signupMutation = useSignup();

  const handleSignup = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    setErrorMsg('');
    signupMutation.mutate(
      { name, email, password, phone: phone || undefined },
      {
        onError: (err: any) => {
          setErrorMsg(err.message || 'Registration failed');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Create Account" subtitle="Join Know Your Route" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Welcome to Route Intelligence</Text>
        <Text style={styles.subheading}>
          Set up your driver profile to connect your vehicles and receive trip guidance.
        </Text>

        {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Alex Rivera"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={18} color={theme.colors.textMuted} />}
          />

          <Input
            label="Email Address"
            placeholder="driver@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={theme.colors.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="Minimum 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={18} color={theme.colors.textMuted} />}
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="+91 98765 43210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={theme.colors.textMuted} />}
          />

          <Button
            title="Create Account"
            size="lg"
            variant="primary"
            loading={signupMutation.isPending}
            onPress={handleSignup}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.linkText}>Sign In</Text>
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
  heading: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subheading: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
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
    marginTop: theme.spacing.xs,
  },
  submitBtn: {
    marginTop: theme.spacing.md,
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
