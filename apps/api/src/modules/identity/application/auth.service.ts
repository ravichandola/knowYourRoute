import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import type {
  AppleOAuthInput,
  AuthResponse,
  GoogleOAuthCodeInput,
  GoogleOAuthInput,
  LoginInput,
  SignupInput,
  User,
} from '@know-your-route/contracts';
import { AuthenticationError, ConflictError } from '../../../platform/errors';
import { DEMO_EMAIL } from '../../../platform/demo/demo-data';
import { toExpirySeconds } from '../domain/token-expiry';
import { OAuthLink, USER_REPOSITORY, UserRepository } from '../domain/user.repository';
import { OAuthTokenVerifierService } from './oauth-token-verifier.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly oauthVerifier: OAuthTokenVerifierService,
  ) {}

  async login(input: LoginInput): Promise<AuthResponse> {
    if (!input.password) {
      throw new AuthenticationError('Password is required');
    }

    const record = await this.users.findByEmail(this.normalizeEmail(input.email));
    const passwordMatches =
      !!record?.passwordHash && (await bcrypt.compare(input.password, record.passwordHash));
    if (!record || !passwordMatches) {
      throw new AuthenticationError('Invalid email or password');
    }

    return this.issueToken(record.user);
  }

  async signup(input: SignupInput): Promise<AuthResponse> {
    const email = this.normalizeEmail(input.email);
    if (await this.users.findByEmail(email)) {
      throw new ConflictError('An account with this email already exists');
    }

    const user = await this.users.create({
      email,
      name: input.name,
      phone: input.phone,
      passwordHash: await bcrypt.hash(input.password, 10),
    });
    return this.issueToken(user);
  }

  async loginWithGoogle(input: GoogleOAuthInput): Promise<AuthResponse> {
    const profile = await this.oauthVerifier.verifyGoogleIdToken(input.idToken);
    return this.loginWithOAuth('GOOGLE', profile);
  }

  async loginWithGoogleCode(input: GoogleOAuthCodeInput): Promise<AuthResponse> {
    const profile = await this.oauthVerifier.exchangeGoogleAuthCode(
      input.code,
      input.redirectUri,
      input.codeVerifier,
    );
    return this.loginWithOAuth('GOOGLE', profile);
  }

  async loginWithApple(input: AppleOAuthInput): Promise<AuthResponse> {
    const profile = await this.oauthVerifier.verifyAppleIdentityToken(input.identityToken);
    const appleName = this.formatAppleName(input.fullName);
    if (appleName) {
      profile.name = appleName;
    }
    return this.loginWithOAuth('APPLE', profile);
  }

  async demoLogin(): Promise<AuthResponse> {
    const record = await this.users.findByEmail(DEMO_EMAIL);
    if (!record) {
      throw new AuthenticationError('Demo account is unavailable');
    }
    return this.issueToken(record.user);
  }

  async validateToken(token: string): Promise<User> {
    const invalid = new AuthenticationError('Invalid or expired authentication token');

    let subject: string;
    try {
      const payload = await this.jwtService.verifyAsync<{ sub?: unknown }>(token);
      if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
        throw invalid;
      }
      subject = payload.sub;
    } catch {
      throw invalid;
    }

    const user = await this.users.findById(subject);
    if (!user) {
      throw invalid;
    }
    return user;
  }

  private async loginWithOAuth(
    provider: OAuthLink['provider'],
    profile: { providerId: string; email: string; name: string; avatarUrl?: string },
  ): Promise<AuthResponse> {
    const existingOAuth = await this.users.findByOAuth(provider, profile.providerId);
    if (existingOAuth) {
      return this.issueToken(existingOAuth);
    }

    const email = this.normalizeEmail(profile.email);
    const existingEmail = await this.users.findByEmail(email);
    if (existingEmail) {
      await this.users.linkOAuth(existingEmail.user.id, { provider, providerId: profile.providerId });
      return this.issueToken(existingEmail.user);
    }

    const user = await this.users.createOAuthUser(
      {
        email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        passwordHash: null,
      },
      { provider, providerId: profile.providerId },
    );
    return this.issueToken(user);
  }

  private formatAppleName(fullName?: AppleOAuthInput['fullName']): string | undefined {
    if (!fullName) {
      return undefined;
    }
    const parts = [fullName.givenName, fullName.familyName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ').trim() : undefined;
  }

  private issueToken(user: User): AuthResponse {
    const expiresIn = toExpirySeconds(this.configService.get<string>('JWT_EXPIRES_IN') || '7d');
    const token = this.jwtService.sign({ sub: user.id, email: user.email }, { expiresIn });
    return { user, token, expiresIn };
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }
}
