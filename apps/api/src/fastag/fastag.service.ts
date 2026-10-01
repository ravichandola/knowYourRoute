import { Injectable, Inject } from '@nestjs/common';
import { FASTAG_PROVIDER, IFastagProvider } from '../providers/fastag/fastag.interface';
import { FastagContext } from '@know-your-route/types';

@Injectable()
export class FastagService {
  constructor(@Inject(FASTAG_PROVIDER) private fastagProvider: IFastagProvider) {}

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
}
