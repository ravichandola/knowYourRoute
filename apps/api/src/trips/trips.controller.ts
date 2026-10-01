import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TripsService } from './trips.service';
import { Trip, TripExplanation, User } from '@know-your-route/types';
import { CreateTripInput } from '@know-your-route/validation';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('trips')
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @Get()
  async listUserTrips(@CurrentUser() user: User): Promise<Trip[]> {
    return this.tripsService.listUserTrips(user.id);
  }

  @Post()
  async createTrip(@CurrentUser() user: User, @Body() body: CreateTripInput): Promise<Trip> {
    return this.tripsService.createTrip(user.id, body);
  }

  @Get(':id')
  async getTrip(@CurrentUser() user: User, @Param('id') id: string): Promise<Trip> {
    return this.tripsService.getTrip(id, user.id);
  }

  @Get(':id/explain')
  async getTripExplanation(@CurrentUser() user: User, @Param('id') id: string): Promise<TripExplanation> {
    return this.tripsService.getTripExplanation(id, user.id);
  }
}
