import { Body, Controller, Post } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutePlanRequest, RoutePlanResponse, User } from '@know-your-route/types';
import { RoutePlanRequestInput } from '@know-your-route/validation';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Post('plan')
  async planRoute(
    @CurrentUser() user: User,
    @Body() request: RoutePlanRequestInput
  ): Promise<RoutePlanResponse> {
    return this.routesService.planRoute(request as RoutePlanRequest, user.id);
  }
}
