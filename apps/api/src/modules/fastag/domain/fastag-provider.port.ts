import type { FastagContext } from '@know-your-route/contracts';

export const FASTAG_PROVIDER = 'FASTAG_PROVIDER';

/** Port: bank / NETC service that reports the live balance of a tag. */
export interface FastagProvider {
  getFastagStatus(tagNumber: string): Promise<FastagContext>;
}
