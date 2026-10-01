import { Controller, Post } from '@nestjs/common';
import {
  routesContract,
  type RoutePlanRequest,
  type RoutePlanResponse,
  type User,
} from '@know-your-route/contracts';
import { ContractBody } from '../../../platform/http';
import { CurrentUser } from '../../identity';
import { PlanRouteUseCase } from '../application/plan-route.use-case';

@Controller(routesContract.basePath)
export class RoutesController {
  constructor(private readonly planRoute: PlanRouteUseCase) {}

  @Post(routesContract.plan.path)
  plan(
    @CurrentUser() user: User,
    @ContractBody(routesContract.plan) request: RoutePlanRequest
  ): Promise<RoutePlanResponse> {
    return this.planRoute.execute(request, user.id);
  }
}
