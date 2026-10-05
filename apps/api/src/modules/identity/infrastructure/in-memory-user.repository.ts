import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { User } from '@know-your-route/contracts';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER_ID } from '../../../platform/demo/demo-data';
import type {
  NewUser,
  OAuthLink,
  OAuthProviderName,
  UserRecord,
  UserRepository,
} from '../domain/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly byEmail = new Map<string, UserRecord>();
  private readonly oauthAccounts = new Map<string, string>();

  constructor() {
    const now = new Date().toISOString();
    this.byEmail.set(DEMO_EMAIL, {
      user: {
        id: DEMO_USER_ID,
        email: DEMO_EMAIL,
        name: 'Alex Rivera',
        phone: '+91 98765 43210',
        isOnboarded: true,
        createdAt: now,
        updatedAt: now,
      },
      passwordHash: bcrypt.hashSync(DEMO_PASSWORD, 10),
    });
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.byEmail.get(email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    for (const record of this.byEmail.values()) {
      if (record.user.id === id) {
        return record.user;
      }
    }
    return null;
  }

  async findByOAuth(provider: OAuthProviderName, providerId: string): Promise<User | null> {
    const userId = this.oauthAccounts.get(this.oauthKey(provider, providerId));
    return userId ? this.findById(userId) : null;
  }

  async create(input: NewUser): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email: input.email,
      name: input.name,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
      isOnboarded: false,
      createdAt: now,
      updatedAt: now,
    };
    this.byEmail.set(input.email, { user, passwordHash: input.passwordHash ?? null });
    return user;
  }

  async createOAuthUser(input: NewUser, oauth: OAuthLink): Promise<User> {
    const user = await this.create(input);
    this.oauthAccounts.set(this.oauthKey(oauth.provider, oauth.providerId), user.id);
    return user;
  }

  async linkOAuth(userId: string, oauth: OAuthLink): Promise<void> {
    this.oauthAccounts.set(this.oauthKey(oauth.provider, oauth.providerId), userId);
  }

  async markOnboarded(id: string): Promise<User | null> {
    for (const [email, record] of this.byEmail.entries()) {
      if (record.user.id === id) {
        const user: User = { ...record.user, isOnboarded: true, updatedAt: new Date().toISOString() };
        this.byEmail.set(email, { ...record, user });
        return user;
      }
    }
    return null;
  }

  private oauthKey(provider: OAuthProviderName, providerId: string): string {
    return `${provider}:${providerId}`;
  }
}
