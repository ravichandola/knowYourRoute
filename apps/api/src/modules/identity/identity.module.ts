import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../platform/database/database.module';
import { repositoryProviders } from '../../platform/persistence/repository-provider';
import { AuthService } from './application/auth.service';
import { UsersService } from './application/users.service';
import { PREFERENCE_REPOSITORY } from './domain/preference.repository';
import { toExpirySeconds } from './domain/token-expiry';
import { USER_REPOSITORY, UserRepository } from './domain/user.repository';
import { AuthController } from './http/auth.controller';
import { JwtAuthGuard } from './http/jwt-auth.guard';
import { UsersController } from './http/users.controller';
import { InMemoryPreferenceRepository } from './infrastructure/in-memory-preference.repository';
import { InMemoryUserRepository } from './infrastructure/in-memory-user.repository';
import { resolveJwtSecret } from './infrastructure/jwt-config';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: resolveJwtSecret(config),
        signOptions: { expiresIn: toExpirySeconds(config.get<string>('JWT_EXPIRES_IN') || '7d') },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    UsersService,
    ...repositoryProviders<UserRepository>(USER_REPOSITORY, {
      memory: InMemoryUserRepository,
      prisma: PrismaUserRepository,
    }),
    { provide: PREFERENCE_REPOSITORY, useClass: InMemoryPreferenceRepository },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class IdentityModule {}
