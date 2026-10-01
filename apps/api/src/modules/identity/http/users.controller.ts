import { Controller, Get, Patch } from '@nestjs/common';
import { usersContract, type TripPreference, type User } from '@know-your-route/contracts';
import { ContractBody } from '../../../platform/http';
import { UsersService } from '../application/users.service';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller(usersContract.basePath)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(usersContract.me.path)
  getMe(@CurrentUser() user: User): Promise<User> {
    return this.usersService.getProfile(user.id);
  }

  @Patch(usersContract.markOnboarded.path)
  markOnboarded(@CurrentUser() user: User): Promise<User> {
    return this.usersService.markOnboarded(user.id);
  }

  @Get(usersContract.getPreferences.path)
  getPreferences(@CurrentUser() user: User): Promise<TripPreference> {
    return this.usersService.getPreferences(user.id);
  }

  @Patch(usersContract.updatePreferences.path)
  updatePreferences(
    @CurrentUser() user: User,
    @ContractBody(usersContract.updatePreferences) prefs: TripPreference
  ): Promise<TripPreference> {
    return this.usersService.updatePreferences(user.id, prefs);
  }
}
