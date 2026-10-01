import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TripsService } from './trips.service';
import { Trip, TripExplanation } from '@know-your-route/types';
import { CreateTripInput } from '@know-your-route/validation';

@Controller('trips')
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @Get()
  async listUserTrips(@Query('userId') userId = 'usr_demo_101'): Promise<Trip[]> {
    return this.tripsService.listUserTrips(userId);
  }

  @Post()
  async createTrip(
    @Query('userId') userId = 'usr_demo_101',
    @Body() body: CreateTripInput
  ): Promise<Trip> {
    return this.tripsService.createTrip(userId, body);
  }

  @Get(':id')
  async getTrip(@Param('id') id: string): Promise<Trip> {
    return this.tripsService.getTrip(id);
  }

  @Get(':id/explain')
  async getTripExplanation(@Param('id') id: string): Promise<TripExplanation> {
    return this.tripsService.getTripExplanation(id);
  }
}
