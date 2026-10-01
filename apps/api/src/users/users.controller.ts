import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, TripPreference } from '@know-your-route/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: User): Promise<User> {
    const profile = await this.usersService.getProfile(user.id);
    return profile;
  }

  @Patch('me/onboarded')
  async markOnboarded(@CurrentUser() user: User): Promise<User> {
    return this.usersService.markOnboarded(user.id);
  }

  @Get('me/preferences')
  async getPreferences(@CurrentUser() user: User): Promise<TripPreference> {
    return this.usersService.getPreferences(user.id);
  }

  @Patch('me/preferences')
  async updatePreferences(
    @CurrentUser() user: User,
    @Body() prefs: TripPreference
  ): Promise<TripPreference> {
    return this.usersService.updatePreferences(user.id, prefs);
  }
}
