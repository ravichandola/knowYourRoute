import { Platform } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { AppleOAuthInput } from '@know-your-route/contracts';
import { api } from '@/shared/api';
import { useAuthStore } from '../store/auth.store';
import { routeAfterAuth } from '../utils/route-after-auth';

async function signInWithAppleNative(): Promise<AppleOAuthInput> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple did not return an identity token');
  }

  return {
    identityToken: credential.identityToken,
    fullName: credential.fullName
      ? {
          givenName: credential.fullName.givenName ?? undefined,
          familyName: credential.fullName.familyName ?? undefined,
        }
      : undefined,
  };
}

export function useAppleSignIn() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const mutation = useMutation({
    mutationFn: async () => {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In is currently available on iOS only');
      }

      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      const payload = await signInWithAppleNative();
      return api.auth.oauthApple({ body: payload });
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      routeAfterAuth(router, data.user.isOnboarded);
    },
  });

  return {
    signIn: () => mutation.mutate(),
    isLoading: mutation.isPending,
    isAvailable: Platform.OS === 'ios',
    isReady: Platform.OS === 'ios',
    error: mutation.error,
  };
}
