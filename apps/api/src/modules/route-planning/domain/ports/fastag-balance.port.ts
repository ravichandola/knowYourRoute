import type { FastagContext } from '@know-your-route/contracts';

export const FASTAG_BALANCE_PORT = 'FASTAG_BALANCE_PORT';
export interface FastagBalancePort {
  /** Returns `undefined` when the user has no FASTag to check against. */
  checkTollSufficiency(query: {
    userId?: string;
    vehicleId?: string;
    tollCost: number;
  }): Promise<FastagContext | undefined>;
}
