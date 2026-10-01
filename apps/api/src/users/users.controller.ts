import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, TripPreference } from '@know-your-route/types';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<User> {
    return this.usersService.getProfile(id);
  }

  @Patch(':id/onboarded')
  async markOnboarded(@Param('id') id: string): Promise<User> {
    return this.usersService.markOnboarded(id);
  }

  @Get(':id/preferences')
  async getPreferences(@Param('id') id: string): Promise<TripPreference> {
    return this.usersService.getPreferences(id);
  }

  @Patch(':id/preferences')
  async updatePreferences(
    @Param('id') id: string,
    @Body() prefs: TripPreference
  ): Promise<TripPreference> {
    return this.usersService.updatePreferences(id, prefs);
  }
}
