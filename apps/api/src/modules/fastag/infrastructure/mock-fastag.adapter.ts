import { Injectable } from '@nestjs/common';
import type { FastagContext } from '@know-your-route/contracts';
import type { FastagProvider } from '../domain/fastag-provider.port';

@Injectable()
export class MockFastagAdapter implements FastagProvider {
  async getFastagStatus(tagNumber: string): Promise<FastagContext> {
    return {
      tagId: tagNumber || 'FT-88392019-ICICI',
      bankName: 'ICICI Bank NETC FASTag',
      currentBalance: 750,
      currency: 'INR',
      isBalanceSufficientForTrip: true,
      lowBalanceWarning: false,
      lastUpdated: new Date().toISOString(),
    };
  }
}
