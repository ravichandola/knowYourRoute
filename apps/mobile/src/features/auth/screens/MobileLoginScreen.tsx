import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { routes } from '@/shared/navigation';
import { ResponsiveContainer, Screen } from '@/shared/layout';
import { Phone } from 'lucide-react-native';
import { Header, Input, Button } from '@/shared/ui';
import { useResponsive } from '@/shared/hooks';
import { welcomeTheme } from '../theme/welcome.theme';

export default function MobileLoginScreen() {
  const router = useRouter();
  const { useWebSplitLayout, contentMaxWidth } = useResponsive();
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const digits = mobile.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    Alert.alert(
      'OTP Verification',
      'Mobile OTP verification is coming soon. Use email sign-in for now.',
      [{ text: 'Go to Sign In', onPress: () => router.push(routes.auth.login) }]
    );
  };

  return (
    <ResponsiveContainer maxWidth={useWebSplitLayout ? 560 : contentMaxWidth}>
      <Screen
        backgroundColor={welcomeTheme.colors.background}
        header={<Header title="Mobile Number" subtitle="We'll send you a one-time password" />}
        scroll={false}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.container,
              useWebSplitLayout && styles.containerWebWide,
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.lead}>
              Enter your mobile number to continue. Standard SMS rates may apply.
            </Text>

            <Input
              label="Mobile Number"
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={(text) => {
                setMobile(text.replace(/\D/g, ''));
                if (error) setError('');
              }}
              error={error}
              leftIcon={<Phone size={18} color={welcomeTheme.colors.textSecondary} />}
            />

            <Button
              title="Continue"
              size="lg"
              variant="primary"
              onPress={handleContinue}
              style={styles.continueButton}
            />

            <Text style={styles.footerNote}>
              By continuing, you may receive an SMS for verification. Message and data rates may
              apply.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    padding: 24,
    flexGrow: 1,
  },
  containerWebWide: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    paddingVertical: 32,
  },
  lead: {
    fontSize: 14,
    lineHeight: 22,
    color: welcomeTheme.colors.textSecondary,
    marginBottom: 24,
  },
  continueButton: {
    marginTop: 8,
    backgroundColor: welcomeTheme.colors.primary,
  },
  footerNote: {
    marginTop: 20,
    fontSize: 12,
    lineHeight: 18,
    color: welcomeTheme.colors.textSecondary,
    textAlign: 'center',
  },
});
