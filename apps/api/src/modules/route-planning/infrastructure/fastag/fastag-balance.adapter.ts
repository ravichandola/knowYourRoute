import { Injectable } from '@nestjs/common';
import type { FastagContext } from '@know-your-route/contracts';
import { FastagFacade } from '../../../fastag';
import type { FastagBalancePort } from '../../domain/ports';

/** Route planning -> fastag. The only place this module depends on the fastag module. */
@Injectable()
export class FastagBalanceAdapter implements FastagBalancePort {
  constructor(private readonly fastag: FastagFacade) {}

  checkTollSufficiency(query: {
    userId?: string;
    vehicleId?: string;
    tollCost: number;
  }): Promise<FastagContext | undefined> {
    return this.fastag.checkTollSufficiency(query);
  }
}
