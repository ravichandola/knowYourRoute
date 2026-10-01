import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  tripsContract,
  type CreateTripInput,
  type Trip,
  type TripExplanation,
  type User,
} from '@know-your-route/contracts';
import { ContractBody } from '../../../platform/http';
import { CurrentUser } from '../../identity';
import { TripsService } from '../application/trips.service';

@Controller(tripsContract.basePath)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get(tripsContract.list.path)
  list(@CurrentUser() user: User): Promise<Trip[]> {
    return this.tripsService.listUserTrips(user.id);
  }

  @Post(tripsContract.create.path)
  create(
    @CurrentUser() user: User,
    @ContractBody(tripsContract.create) body: CreateTripInput
  ): Promise<Trip> {
    return this.tripsService.createTrip(user.id, body);
  }

  @Get(tripsContract.get.path)
  get(@CurrentUser() user: User, @Param('id') id: string): Promise<Trip> {
    return this.tripsService.getTrip(id, user.id);
  }

  @Get(tripsContract.explain.path)
  explain(@CurrentUser() user: User, @Param('id') id: string): Promise<TripExplanation> {
    return this.tripsService.getTripExplanation(id, user.id);
  }
}
