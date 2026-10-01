import { Controller, Get, Param, Query } from '@nestjs/common';
import { FastagService } from './fastag.service';
import { FastagContext } from '@know-your-route/types';

@Controller('fastag')
export class FastagController {
  constructor(private fastagService: FastagService) {}

  @Get(':tagNumber/status')
  async getStatus(@Param('tagNumber') tagNumber: string): Promise<FastagContext> {
    return this.fastagService.getStatus(tagNumber);
  }

  @Get(':tagNumber/verify')
  async verifySufficiency(
    @Param('tagNumber') tagNumber: string,
    @Query('tollCost') tollCost: number
  ): Promise<FastagContext> {
    return this.fastagService.verifyTollSufficiency(tagNumber, Number(tollCost) || 0);
  }
}
