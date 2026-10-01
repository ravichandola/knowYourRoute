import type { User } from '@know-your-route/contracts';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRecord {
  user: User;
  passwordHash: string | null;
}

export interface NewUser {
  email: string;
  name: string;
  phone?: string;
  passwordHash: string;
}

/** Port: how identity stores accounts. Implemented in `infrastructure/`. */
export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<User | null>;
  create(input: NewUser): Promise<User>;
  markOnboarded(id: string): Promise<User | null>;
}
