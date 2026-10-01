import React, { useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useResponsive } from '@/shared/hooks';
import { ResponsiveContainer } from '@/shared/layout';
import { WelcomeMobileLayout, WelcomeWebLayout } from '../components/welcome';
import {
  useGoogleSignIn,
  useGoogleSignInDisabled,
  type GoogleSignInController,
} from '../hooks/useGoogleSignIn';
import { useAppleSignIn } from '../hooks/useAppleSignIn';
import {
  getGoogleRedirectUri,
  getGoogleSetupMessage,
  hasAnyGoogleClientId,
  isGoogleConfiguredForPlatform,
} from '../config/oauth.config';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

interface WelcomeScreenContentProps {
  googleSignIn: GoogleSignInController;
}

function WelcomeScreenContent({ googleSignIn }: WelcomeScreenContentProps) {
  const router = useRouter();
  const { useMobileLayout, useWebSplitLayout } = useResponsive();
  const appleSignIn = useAppleSignIn();

  const handleSkip = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleMobileLogin = useCallback(() => {
    router.push('/(auth)/mobile-login');
  }, [router]);

  const handleGoogleLogin = useCallback(() => {
    if (!googleSignIn.isConfigured) {
      const message = hasAnyGoogleClientId()
        ? getGoogleSetupMessage()
        : `${getGoogleSetupMessage()}\n\nTip: Restart Expo after editing .env (Ctrl+C, then pnpm start).`;
      Alert.alert('Google Sign-In Not Configured', message);
      return;
    }
    googleSignIn.signIn();
  }, [googleSignIn]);

  const handleAppleLogin = useCallback(() => {
    if (!appleSignIn.isAvailable) {
      Alert.alert('Apple Sign-In', 'Apple Sign-In is not available on this device.');
      return;
    }
    appleSignIn.signIn();
  }, [appleSignIn]);

  const handleTerms = useCallback(() => {
    Linking.openURL('https://knowyourroute.app/terms').catch(() => {
      Alert.alert('Terms of Service', 'Terms of Service page will be available soon.');
    });
  }, []);

  const handlePrivacy = useCallback(() => {
    Linking.openURL('https://knowyourroute.app/privacy').catch(() => {
      Alert.alert('Privacy Policy', 'Privacy Policy page will be available soon.');
    });
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      console.info('[Google OAuth] Authorized redirect URI:', getGoogleRedirectUri());
    }
  }, []);

  React.useEffect(() => {
    const error = googleSignIn.error || appleSignIn.error;
    if (!error) {
      return;
    }
    Alert.alert('Sign-In Failed', getErrorMessage(error, 'Unable to complete sign-in.'));
  }, [googleSignIn.error, appleSignIn.error]);

  const layoutProps = {
    onSkip: handleSkip,
    onMobileLogin: handleMobileLogin,
    onGoogleLogin: handleGoogleLogin,
    onAppleLogin: handleAppleLogin,
    onTerms: handleTerms,
    onPrivacy: handlePrivacy,
    googleLoading: googleSignIn.isLoading,
    appleLoading: appleSignIn.isLoading,
    showAppleSignIn: appleSignIn.isAvailable,
  };

  const content = useWebSplitLayout ? (
    <WelcomeWebLayout {...layoutProps} />
  ) : (
    <WelcomeMobileLayout {...layoutProps} />
  );

  return (
    <>
      <StatusBar style="light" />
      {useMobileLayout ? (
        <ResponsiveContainer centered={!useWebSplitLayout}>{content}</ResponsiveContainer>
      ) : (
        content
      )}
    </>
  );
}

function WelcomeScreenWithGoogle() {
  const googleSignIn = useGoogleSignIn();
  return <WelcomeScreenContent googleSignIn={googleSignIn} />;
}

function WelcomeScreenWithoutGoogle() {
  const googleSignIn = useGoogleSignInDisabled();
  return <WelcomeScreenContent googleSignIn={googleSignIn} />;
}

export default function WelcomeScreen() {
  if (isGoogleConfiguredForPlatform()) {
    return <WelcomeScreenWithGoogle />;
  }
  return <WelcomeScreenWithoutGoogle />;
}
