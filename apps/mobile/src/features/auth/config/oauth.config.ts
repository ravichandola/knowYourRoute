import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

declare const process: { env: Record<string, string | undefined> };

export const oauthConfig = {
  google: {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    get isConfigured() {
      return isGoogleConfiguredForPlatform();
    },
  },
  apple: {
    clientId: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID || 'com.knowyourroute.app',
  },
} as const;

/** Google OAuth client ID required for the current platform (expo-auth-session rules). */
export function hasAnyGoogleClientId(): boolean {
  const { webClientId, iosClientId, androidClientId } = oauthConfig.google;
  return !!(webClientId || iosClientId || androidClientId);
}

export function isGoogleConfiguredForPlatform(): boolean {
  const { webClientId, iosClientId, androidClientId } = oauthConfig.google;

  if (Platform.OS === 'web') {
    return !!webClientId;
  }
  if (Platform.OS === 'ios') {
    return !!(iosClientId || webClientId);
  }
  if (Platform.OS === 'android') {
    return !!(androidClientId || webClientId);
  }

  return hasAnyGoogleClientId();
}

/** Default Expo web dev port (matches Google Cloud Console redirect URI). */
export const DEFAULT_WEB_DEV_PORT = '19006';

/** sessionStorage keys for web OAuth redirect (PKCE verifier survives page reload). */
export const GOOGLE_OAUTH_SESSION_KEYS = {
  codeVerifier: 'kyr_google_oauth_code_verifier',
  redirectUri: 'kyr_google_oauth_redirect_uri',
} as const;

export function persistGoogleOAuthSession(codeVerifier: string, redirectUri: string): void {
  if (Platform.OS !== 'web' || typeof sessionStorage === 'undefined') {
    return;
  }
  sessionStorage.setItem(GOOGLE_OAUTH_SESSION_KEYS.codeVerifier, codeVerifier);
  sessionStorage.setItem(GOOGLE_OAUTH_SESSION_KEYS.redirectUri, redirectUri);
}

/**
 * Redirect URI sent to Google on web. Must exactly match an Authorized redirect URI
 * in Google Cloud Console (Web client → Credentials).
 */
export function getGoogleRedirectUri(): string {
  const configured = process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (Platform.OS === 'web') {
    const port = process.env.EXPO_PUBLIC_WEB_DEV_PORT || DEFAULT_WEB_DEV_PORT;
    return `http://localhost:${port}`;
  }

  return makeRedirectUri({ preferLocalhost: true });
}

/** Warn when the browser origin does not match the OAuth redirect URI. */
export function warnIfGoogleRedirectUriMismatch(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  const redirectUri = getGoogleRedirectUri();
  const origin = window.location.origin;

  if (origin !== redirectUri) {
    console.warn(
      `[Google OAuth] Browser is at ${origin} but redirect URI is ${redirectUri}. ` +
        'Use the same port for Expo and register that exact URI in Google Cloud Console.',
    );
  }
}

export function getGoogleSetupMessage(): string {
  if (Platform.OS === 'web') {
    const redirectUri = getGoogleRedirectUri();
    return (
      'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env, register this redirect URI in Google Cloud Console ' +
      `(Web client → Authorized redirect URIs): ${redirectUri}, then restart Expo on that port.`
    );
  }
  if (Platform.OS === 'ios') {
    return 'Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID to your .env file, then restart Expo.';
  }
  if (Platform.OS === 'android') {
    return 'Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID to your .env file, then restart Expo.';
  }
  return 'Configure Google OAuth client IDs in your .env file, then restart Expo.';
}
