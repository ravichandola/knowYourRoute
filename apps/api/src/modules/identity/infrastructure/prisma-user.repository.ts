import { Injectable } from '@nestjs/common';
import type { User } from '@know-your-route/contracts';
import { PrismaService } from '../../../platform/database/prisma.service';
import type { NewUser, UserRecord, UserRepository } from '../domain/user.repository';

interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const toUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  phone: row.phone ?? undefined,
  avatarUrl: row.avatarUrl ?? undefined,
  isOnboarded: row.isOnboarded,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? { user: toUser(row), passwordHash: row.passwordHash } : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? toUser(row) : null;
  }

  async create(input: NewUser): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        phone: input.phone,
        passwordHash: input.passwordHash,
        isOnboarded: false,
      },
    });
    return toUser(row);
  }

  async markOnboarded(id: string): Promise<User | null> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }
    const row = await this.prisma.user.update({ where: { id }, data: { isOnboarded: true } });
    return toUser(row);
  }
}
