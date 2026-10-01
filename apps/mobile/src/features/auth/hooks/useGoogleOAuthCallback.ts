import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/shared/api';
import { useAuthStore } from '../store/auth.store';
import {
  getGoogleRedirectUri,
  GOOGLE_OAUTH_SESSION_KEYS,
} from '../config/oauth.config';
import { routeAfterAuth } from '../utils/route-after-auth';

function clearOAuthQueryParams(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.history.replaceState({}, '', window.location.pathname);
}

function clearOAuthSession(): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  sessionStorage.removeItem(GOOGLE_OAUTH_SESSION_KEYS.codeVerifier);
  sessionStorage.removeItem(GOOGLE_OAUTH_SESSION_KEYS.redirectUri);
}

/**
 * Web-only: after Google redirects back with ?code=..., exchange the code via our API.
 * Full-page redirects discard in-memory state, so PKCE verifier is read from sessionStorage.
 */
export function useGoogleOAuthCallback() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || startedRef.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const oauthError = params.get('error');

    if (oauthError) {
      clearOAuthQueryParams();
      clearOAuthSession();
      setError(new Error(params.get('error_description') || oauthError));
      return;
    }

    if (!code) {
      return;
    }

    startedRef.current = true;
    setIsProcessing(true);

    const codeVerifier = sessionStorage.getItem(GOOGLE_OAUTH_SESSION_KEYS.codeVerifier);
    const redirectUri =
      sessionStorage.getItem(GOOGLE_OAUTH_SESSION_KEYS.redirectUri) ?? getGoogleRedirectUri();

    if (!codeVerifier) {
      clearOAuthQueryParams();
      clearOAuthSession();
      setIsProcessing(false);
      setError(
        new Error('Google sign-in session expired. Please try again.'),
      );
      return;
    }

    api.auth
      .oauthGoogleCode({
        body: { code, redirectUri, codeVerifier },
      })
      .then((data) => {
        clearOAuthQueryParams();
        clearOAuthSession();
        setAuth(data.user, data.token);
        routeAfterAuth(router, data.user.isOnboarded);
      })
      .catch((cause) => {
        clearOAuthQueryParams();
        clearOAuthSession();
        setError(
          cause instanceof Error ? cause : new Error('Google sign-in failed'),
        );
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [router, setAuth]);

  return { isProcessingOAuthCallback: isProcessing, oauthCallbackError: error };
}
