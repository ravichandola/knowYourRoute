import type { FastagContext } from '@know-your-route/contracts';

const LOW_BALANCE_THRESHOLD = 200;

/** Pure rule: does the tag balance cover the expected toll, and should the user be warned. */
export function evaluateTollSufficiency(status: FastagContext, expectedTollCost: number): FastagContext {
  const isSufficient = status.currentBalance >= expectedTollCost;
  const shortfall = isSufficient ? 0 : expectedTollCost - status.currentBalance;

  return {
    ...status,
    isBalanceSufficientForTrip: isSufficient,
    shortfallAmount: shortfall > 0 ? shortfall : undefined,
    lowBalanceWarning: status.currentBalance < LOW_BALANCE_THRESHOLD || !isSufficient,
  };
}
