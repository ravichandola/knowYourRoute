import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { AuthenticationError } from '../../../platform/errors';

export interface OAuthProfile {
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

@Injectable()
export class OAuthTokenVerifierService {
  constructor(private readonly config: ConfigService) {}

  async exchangeGoogleAuthCode(
    code: string,
    redirectUri: string,
    codeVerifier?: string,
  ): Promise<OAuthProfile> {
    const webClientId = this.getGoogleWebClientId();
    const clientSecret = this.config.get<string>('GOOGLE_OAUTH_CLIENT_SECRET');

    if (!webClientId || !clientSecret) {
      throw new AuthenticationError('Google web OAuth is not configured on the server');
    }

    const client = new OAuth2Client(webClientId, clientSecret, redirectUri);

    try {
      const { tokens } = await client.getToken({
        code,
        redirect_uri: redirectUri,
        codeVerifier,
      });

      if (!tokens.id_token) {
        throw new AuthenticationError('Google did not return an ID token');
      }

      return this.verifyGoogleIdToken(tokens.id_token);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Invalid Google authorization code');
    }
  }

  async verifyGoogleIdToken(idToken: string): Promise<OAuthProfile> {
    const audiences = this.getGoogleAudiences();
    if (audiences.length === 0) {
      throw new AuthenticationError('Google Sign-In is not configured on the server');
    }

    const client = new OAuth2Client();
    let payload: {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };

    try {
      const ticket = await client.verifyIdToken({ idToken, audience: audiences });
      payload = ticket.getPayload() ?? {};
    } catch {
      throw new AuthenticationError('Invalid Google sign-in token');
    }

    if (!payload.sub || !payload.email) {
      throw new AuthenticationError('Google account did not provide a verified email');
    }

    if (payload.email_verified === false) {
      throw new AuthenticationError('Google email address is not verified');
    }

    return {
      providerId: payload.sub,
      email: payload.email.toLowerCase().trim(),
      name: payload.name?.trim() || payload.email.split('@')[0] || 'Traveler',
      avatarUrl: payload.picture,
    };
  }

  async verifyAppleIdentityToken(identityToken: string): Promise<OAuthProfile> {
    const audience = this.config.get<string>('APPLE_CLIENT_ID') || 'com.knowyourroute.app';

    let payload: {
      sub?: string;
      email?: string;
    };

    try {
      const verified = await jwtVerify(identityToken, APPLE_JWKS, {
        issuer: 'https://appleid.apple.com',
        audience,
      });
      payload = verified.payload as { sub?: string; email?: string };
    } catch {
      throw new AuthenticationError('Invalid Apple sign-in token');
    }

    if (!payload.sub) {
      throw new AuthenticationError('Invalid Apple sign-in token');
    }

    const email =
      payload.email?.toLowerCase().trim() ||
      `apple+${payload.sub}@oauth.knowyourroute.internal`;

    return {
      providerId: payload.sub,
      email,
      name: 'Traveler',
    };
  }

  private getGoogleWebClientId(): string | undefined {
    const explicit = this.config.get<string>('GOOGLE_OAUTH_WEB_CLIENT_ID');
    if (explicit) {
      return explicit;
    }

    const audiences = this.getGoogleAudiences();
    return audiences.length > 0 ? audiences[audiences.length - 1] : undefined;
  }

  private getGoogleAudiences(): string[] {
    const raw = this.config.get<string>('GOOGLE_OAUTH_CLIENT_IDS') || '';
    const fromList = raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    const single = this.config.get<string>('GOOGLE_OAUTH_CLIENT_ID');
    return [...new Set([...(single ? [single] : []), ...fromList])];
  }
}
