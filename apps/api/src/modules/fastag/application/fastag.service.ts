import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { FastagContext } from '@know-your-route/contracts';
import {
  FASTAG_CONNECTION_REPOSITORY,
  FastagConnectionRepository,
} from '../domain/fastag-connection.repository';
import { FASTAG_PROVIDER, FastagProvider } from '../domain/fastag-provider.port';
import { evaluateTollSufficiency } from '../domain/toll-sufficiency';

@Injectable()
export class FastagService {
  constructor(
    @Inject(FASTAG_CONNECTION_REPOSITORY) private readonly connections: FastagConnectionRepository,
    @Inject(FASTAG_PROVIDER) private readonly provider: FastagProvider
  ) {}

  getStatus(tagNumber: string): Promise<FastagContext> {
    return this.provider.getFastagStatus(tagNumber);
  }

  async verifyTollSufficiency(tagNumber: string, expectedTollCost: number): Promise<FastagContext> {
    return evaluateTollSufficiency(await this.provider.getFastagStatus(tagNumber), expectedTollCost);
  }

  async resolveTagNumber(userId?: string, vehicleId?: string): Promise<string | undefined> {
    if (!userId) {
      return undefined;
    }
    return (await this.connections.findForUser(userId, vehicleId))?.tagNumber;
  }

  async assertTagOwnedByUser(userId: string, tagNumber: string): Promise<void> {
    const owned = await this.connections.listByUser(userId);
    if (!owned.some((connection) => connection.tagNumber === tagNumber)) {
      throw new ForbiddenException('FASTag is not linked to this account');
    }
  }

  async getStatusForUser(userId: string, vehicleId?: string): Promise<FastagContext> {
    return this.getStatus(await this.requireTagNumber(userId, vehicleId));
  }

  async verifyForUser(userId: string, tollCost: number, vehicleId?: string): Promise<FastagContext> {
    return this.verifyTollSufficiency(await this.requireTagNumber(userId, vehicleId), tollCost);
  }

  private async requireTagNumber(userId: string, vehicleId?: string): Promise<string> {
    const tagNumber = await this.resolveTagNumber(userId, vehicleId);
    if (!tagNumber) {
      throw new ForbiddenException('No FASTag is linked to this account');
    }
    return tagNumber;
  }
}
