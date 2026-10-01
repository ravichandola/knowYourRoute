import { Injectable } from '@nestjs/common';
import type { FastagContext } from '@know-your-route/contracts';
import { FastagService } from './fastag.service';

export interface TollCheck {
  userId?: string;
  vehicleId?: string;
  tollCost: number;
}

/** The only entry point other modules use to ask FASTag questions. */
@Injectable()
export class FastagFacade {
  constructor(private readonly fastagService: FastagService) {}

  /** Returns `undefined` when the user has no FASTag linked (not an error for planners). */
  async checkTollSufficiency(check: TollCheck): Promise<FastagContext | undefined> {
    const tagNumber = await this.fastagService.resolveTagNumber(check.userId, check.vehicleId);
    return tagNumber
      ? this.fastagService.verifyTollSufficiency(tagNumber, check.tollCost)
      : undefined;
  }
}
