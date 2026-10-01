import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { FastagConnection, FastagContext } from '@know-your-route/types';
import { FASTAG_PROVIDER, IFastagProvider } from '../providers/fastag/fastag.interface';
import { PrismaService } from '../common/prisma.service';
import { DEMO_USER_ID } from '../auth/auth.constants';

@Injectable()
export class FastagService {
  private readonly fallbackConnections: FastagConnection[] = [
    {
      id: 'fst_demo_1',
      userId: DEMO_USER_ID,
      vehicleId: 'veh_demo_creta',
      tagNumber: 'FT-88392019-ICICI',
      bankName: 'ICICI Bank NETC FASTag',
      balance: 750,
      status: 'ACTIVE',
    },
  ];

  constructor(
    @Inject(FASTAG_PROVIDER) private fastagProvider: IFastagProvider,
    private prisma: PrismaService
  ) {}

  async getStatus(tagNumber: string): Promise<FastagContext> {
    return this.fastagProvider.getFastagStatus(tagNumber);
  }

  async verifyTollSufficiency(tagNumber: string, expectedTollCost: number): Promise<FastagContext> {
    const status = await this.fastagProvider.getFastagStatus(tagNumber);
    const isSufficient = status.currentBalance >= expectedTollCost;
    const shortfall = isSufficient ? 0 : expectedTollCost - status.currentBalance;

    return {
      ...status,
      isBalanceSufficientForTrip: isSufficient,
      shortfallAmount: shortfall > 0 ? shortfall : undefined,
      lowBalanceWarning: status.currentBalance < 200 || !isSufficient,
    };
  }

  async resolveTagNumber(userId?: string, vehicleId?: string): Promise<string | undefined> {
    if (!userId) {
      return undefined;
    }

    try {
      const conn = await this.prisma.fastagConnection.findFirst({
        where: {
          userId,
          ...(vehicleId ? { vehicleId } : {}),
        },
      });
      if (conn) {
        return conn.tagNumber;
      }
    } catch {
      // Fallback
    }

    const match = this.fallbackConnections.find(
      (c) => c.userId === userId && (!vehicleId || c.vehicleId === vehicleId)
    );
    return match?.tagNumber;
  }

  async assertTagOwnedByUser(userId: string, tagNumber: string): Promise<void> {
    const owned = await this.listConnections(userId);
    if (!owned.some((c) => c.tagNumber === tagNumber)) {
      throw new ForbiddenException('FASTag is not linked to this account');
    }
  }

  async getStatusForUser(userId: string, vehicleId?: string): Promise<FastagContext> {
    const tagNumber = await this.resolveTagNumber(userId, vehicleId);
    if (!tagNumber) {
      throw new ForbiddenException('No FASTag is linked to this account');
    }
    return this.getStatus(tagNumber);
  }

  async verifyForUser(userId: string, tollCost: number, vehicleId?: string): Promise<FastagContext> {
    const tagNumber = await this.resolveTagNumber(userId, vehicleId);
    if (!tagNumber) {
      throw new ForbiddenException('No FASTag is linked to this account');
    }
    return this.verifyTollSufficiency(tagNumber, tollCost);
  }

  private async listConnections(userId: string): Promise<FastagConnection[]> {
    try {
      const rows = await this.prisma.fastagConnection.findMany({ where: { userId } });
      if (rows.length > 0) {
        return rows.map((row) => ({
          id: row.id,
          userId: row.userId,
          vehicleId: row.vehicleId,
          tagNumber: row.tagNumber,
          bankName: row.bankName,
          balance: row.balance,
          status: row.status as FastagConnection['status'],
        }));
      }
    } catch {
      // Fallback
    }
    return this.fallbackConnections.filter((c) => c.userId === userId);
  }
}
