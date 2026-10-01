import { Controller, Get, Param } from '@nestjs/common';
import {
  fastagContract,
  type FastagContext,
  type FastagStatusQuery,
  type FastagVerifyQuery,
  type User,
} from '@know-your-route/contracts';
import { ContractQuery } from '../../../platform/http';
import { CurrentUser } from '../../identity';
import { FastagService } from '../application/fastag.service';

@Controller(fastagContract.basePath)
export class FastagController {
  constructor(private readonly fastagService: FastagService) {}

  @Get(fastagContract.myStatus.path)
  getMyStatus(
    @CurrentUser() user: User,
    @ContractQuery(fastagContract.myStatus) query: FastagStatusQuery
  ): Promise<FastagContext> {
    return this.fastagService.getStatusForUser(user.id, query.vehicleId);
  }

  @Get(fastagContract.myVerify.path)
  verifyMySufficiency(
    @CurrentUser() user: User,
    @ContractQuery(fastagContract.myVerify) query: FastagVerifyQuery
  ): Promise<FastagContext> {
    return this.fastagService.verifyForUser(user.id, query.tollCost, query.vehicleId);
  }

  @Get(fastagContract.tagStatus.path)
  async getTagStatus(
    @CurrentUser() user: User,
    @Param('tagNumber') tagNumber: string
  ): Promise<FastagContext> {
    await this.fastagService.assertTagOwnedByUser(user.id, tagNumber);
    return this.fastagService.getStatus(tagNumber);
  }

  @Get(fastagContract.tagVerify.path)
  async verifyTagSufficiency(
    @CurrentUser() user: User,
    @Param('tagNumber') tagNumber: string,
    @ContractQuery(fastagContract.tagVerify) query: FastagVerifyQuery
  ): Promise<FastagContext> {
    await this.fastagService.assertTagOwnedByUser(user.id, tagNumber);
    return this.fastagService.verifyTollSufficiency(tagNumber, query.tollCost);
  }
}
