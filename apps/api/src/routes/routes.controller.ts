import { Controller, Post, Body } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutePlanRequest, RoutePlanResponse } from '@know-your-route/types';
import { RoutePlanRequestInput } from '@know-your-route/validation';

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Post('plan')
  async planRoute(@Body() request: RoutePlanRequestInput): Promise<RoutePlanResponse> {
    return this.routesService.planRoute(request as RoutePlanRequest);
  }
}
