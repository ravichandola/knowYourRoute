import { Controller, Get, Param, Query } from '@nestjs/common';
import { FastagService } from './fastag.service';
import { FastagContext, User } from '@know-your-route/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('fastag')
export class FastagController {
  constructor(private fastagService: FastagService) {}

  @Get('me/status')
  async getMyStatus(
    @CurrentUser() user: User,
    @Query('vehicleId') vehicleId?: string
  ): Promise<FastagContext> {
    return this.fastagService.getStatusForUser(user.id, vehicleId);
  }

  @Get('me/verify')
  async verifyMySufficiency(
    @CurrentUser() user: User,
    @Query('tollCost') tollCost: number,
    @Query('vehicleId') vehicleId?: string
  ): Promise<FastagContext> {
    return this.fastagService.verifyForUser(user.id, Number(tollCost) || 0, vehicleId);
  }

  @Get(':tagNumber/status')
  async getStatus(
    @CurrentUser() user: User,
    @Param('tagNumber') tagNumber: string
  ): Promise<FastagContext> {
    await this.fastagService.assertTagOwnedByUser(user.id, tagNumber);
    return this.fastagService.getStatus(tagNumber);
  }

  @Get(':tagNumber/verify')
  async verifySufficiency(
    @CurrentUser() user: User,
    @Param('tagNumber') tagNumber: string,
    @Query('tollCost') tollCost: number
  ): Promise<FastagContext> {
    await this.fastagService.assertTagOwnedByUser(user.id, tagNumber);
    return this.fastagService.verifyTollSufficiency(tagNumber, Number(tollCost) || 0);
  }
}
