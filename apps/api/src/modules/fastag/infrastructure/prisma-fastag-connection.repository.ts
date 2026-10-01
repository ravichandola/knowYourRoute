import { Injectable } from '@nestjs/common';
import type { FastagConnection } from '@know-your-route/contracts';
import { PrismaService } from '../../../platform/database/prisma.service';
import type { FastagConnectionRepository } from '../domain/fastag-connection.repository';

interface FastagRow {
  id: string;
  userId: string;
  vehicleId: string;
  tagNumber: string;
  bankName: string;
  balance: number;
  status: string;
}

const toConnection = (row: FastagRow): FastagConnection => ({
  id: row.id,
  userId: row.userId,
  vehicleId: row.vehicleId,
  tagNumber: row.tagNumber,
  bankName: row.bankName,
  balance: row.balance,
  status: row.status as FastagConnection['status'],
});

@Injectable()
export class PrismaFastagConnectionRepository implements FastagConnectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByUser(userId: string): Promise<FastagConnection[]> {
    const rows = await this.prisma.fastagConnection.findMany({ where: { userId } });
    return rows.map(toConnection);
  }

  async findForUser(userId: string, vehicleId?: string): Promise<FastagConnection | null> {
    const row = await this.prisma.fastagConnection.findFirst({
      where: { userId, ...(vehicleId ? { vehicleId } : {}) },
    });
    return row ? toConnection(row) : null;
  }
}
