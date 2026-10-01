import React, { useEffect } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/auth.store';
import { useGoogleOAuthCallback } from '../hooks/useGoogleOAuthCallback';
import { routeAfterAuth } from '../utils/route-after-auth';
import WelcomeScreen from './WelcomeScreen';
import { welcomeTheme } from '../theme/welcome.theme';

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { isProcessingOAuthCallback, oauthCallbackError } = useGoogleOAuthCallback();

  useEffect(() => {
    if (isAuthenticated) {
      routeAfterAuth(router, Boolean(user?.isOnboarded));
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!oauthCallbackError) {
      return;
    }
    Alert.alert('Sign-In Failed', oauthCallbackError.message);
  }, [oauthCallbackError]);

  if (isLoading || isAuthenticated || isProcessingOAuthCallback) {
    return <View style={styles.placeholder} />;
  }

  return <WelcomeScreen />;
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: welcomeTheme.colors.background,
  },
});
