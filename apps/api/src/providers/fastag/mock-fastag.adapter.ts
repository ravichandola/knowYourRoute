import { Injectable } from '@nestjs/common';
import { IFastagProvider } from './fastag.interface';
import { FastagContext } from '@know-your-route/types';

@Injectable()
export class MockFastagAdapter implements IFastagProvider {
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
