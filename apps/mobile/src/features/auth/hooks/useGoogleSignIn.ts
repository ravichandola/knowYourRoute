import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri, ResponseType } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { api } from '@/shared/api';
import { useAuthStore } from '../store/auth.store';
import {
  getGoogleRedirectUri,
  getGoogleSetupMessage,
  isGoogleConfiguredForPlatform,
  oauthConfig,
  persistGoogleOAuthSession,
  warnIfGoogleRedirectUriMismatch,
} from '../config/oauth.config';
import { routeAfterAuth } from '../utils/route-after-auth';

WebBrowser.maybeCompleteAuthSession();

export type GoogleSignInController = {
  signIn: () => void;
  isLoading: boolean;
  isConfigured: boolean;
  isReady: boolean;
  error: Error | null;
  redirectUri?: string;
};

/** Safe stub when Google auth is not configured for this platform. */
export function useGoogleSignInDisabled(): GoogleSignInController {
  return {
    signIn: () => {},
    isLoading: false,
    isConfigured: false,
    isReady: false,
    error: null,
  };
}

function useGoogleSignInWeb(): GoogleSignInController {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { google } = oauthConfig;
  const redirectUri = getGoogleRedirectUri();

  useEffect(() => {
    warnIfGoogleRedirectUriMismatch();
  }, [redirectUri]);

  const [request, , promptAsync] = Google.useAuthRequest({
    webClientId: google.webClientId,
    // Both platform hooks always run. expo-auth-session picks the client id for the current OS.
    iosClientId: google.iosClientId,
    androidClientId: google.androidClientId,
    redirectUri,
    responseType: ResponseType.Code,
    scopes: ['openid', 'profile', 'email'],
    usePKCE: true,
    // Exchange happens on our API with GOOGLE_OAUTH_CLIENT_SECRET — not in the browser.
    shouldAutoExchangeCode: false,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!google.webClientId) {
        throw new Error(getGoogleSetupMessage());
      }
      if (!request) {
        throw new Error('Google Sign-In is still initializing. Please try again.');
      }

      if (request.codeVerifier) {
        persistGoogleOAuthSession(request.codeVerifier, redirectUri);
      }

      const result = await promptAsync();
      if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Google sign-in was cancelled');
      }
      if (result.type !== 'success') {
        throw new Error('Google sign-in failed');
      }

      const code = result.params.code;
      if (!code) {
        throw new Error('Google did not return an authorization code');
      }

      return api.auth.oauthGoogleCode({
        body: {
          code,
          redirectUri,
          codeVerifier: request.codeVerifier,
        },
      });
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      routeAfterAuth(router, data.user.isOnboarded);
    },
  });

  return {
    signIn: () => mutation.mutate(),
    isLoading: mutation.isPending,
    isConfigured: !!google.webClientId,
    isReady: !!request,
    error: mutation.error,
    redirectUri,
  };
}

function useGoogleSignInNative(): GoogleSignInController {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { google } = oauthConfig;

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: google.webClientId,
    iosClientId: google.iosClientId,
    androidClientId: google.androidClientId,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isGoogleConfiguredForPlatform()) {
        throw new Error(getGoogleSetupMessage());
      }
      if (!request) {
        throw new Error('Google Sign-In is still initializing. Please try again.');
      }

      const result = await promptAsync();
      if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Google sign-in was cancelled');
      }
      if (result.type !== 'success') {
        throw new Error('Google sign-in failed');
      }

      const idToken = result.params.id_token;
      if (!idToken) {
        throw new Error('Google did not return an ID token');
      }

      return api.auth.oauthGoogle({ body: { idToken } });
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      routeAfterAuth(router, data.user.isOnboarded);
    },
  });

  return {
    signIn: () => mutation.mutate(),
    isLoading: mutation.isPending,
    isConfigured: isGoogleConfiguredForPlatform(),
    isReady: !!request,
    error: mutation.error,
  };
}

/**
 * Google Sign-In:
 * - Web: authorization code + PKCE → API exchanges with client secret
 * - iOS/Android: native ID token flow
 */
export function useGoogleSignIn(): GoogleSignInController {
  const web = useGoogleSignInWeb();
  const native = useGoogleSignInNative();
  return Platform.OS === 'web' ? web : native;
}
