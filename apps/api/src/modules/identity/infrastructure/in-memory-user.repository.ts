import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { User } from '@know-your-route/contracts';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER_ID } from '../../../platform/demo/demo-data';
import type { NewUser, UserRecord, UserRepository } from '../domain/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly byEmail = new Map<string, UserRecord>();

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

  async create(input: NewUser): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email: input.email,
      name: input.name,
      phone: input.phone,
      isOnboarded: false,
      createdAt: now,
      updatedAt: now,
    };
    this.byEmail.set(input.email, { user, passwordHash: input.passwordHash });
    return user;
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
}
