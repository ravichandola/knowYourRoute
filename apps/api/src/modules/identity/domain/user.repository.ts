import type { User } from '@know-your-route/contracts';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export type OAuthProviderName = 'GOOGLE' | 'APPLE';

export interface UserRecord {
  user: User;
  passwordHash: string | null;
}

export interface NewUser {
  email: string;
  name: string;
  phone?: string;
  passwordHash?: string | null;
  avatarUrl?: string;
}

export interface OAuthLink {
  provider: OAuthProviderName;
  providerId: string;
}

/** Port: how identity stores accounts. Implemented in `infrastructure/`. */
export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<User | null>;
  findByOAuth(provider: OAuthProviderName, providerId: string): Promise<User | null>;
  create(input: NewUser): Promise<User>;
  createOAuthUser(input: NewUser, oauth: OAuthLink): Promise<User>;
  linkOAuth(userId: string, oauth: OAuthLink): Promise<void>;
  markOnboarded(id: string): Promise<User | null>;
}
