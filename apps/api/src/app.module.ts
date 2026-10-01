import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ProvidersModule } from './providers/providers.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { RoutesModule } from './routes/routes.module';
import { TripsModule } from './trips/trips.module';
import { EnergyModule } from './energy/energy.module';
import { SafetyModule } from './safety/safety.module';
import { FastagModule } from './fastag/fastag.module';
import { AIModule } from './ai/ai.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    ProvidersModule,
    AIModule,
    EnergyModule,
    SafetyModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    FastagModule,
    RoutesModule,
    TripsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
