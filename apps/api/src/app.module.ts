import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FastagModule } from './modules/fastag';
import { IdentityModule } from './modules/identity';
import { RoutePlanningModule } from './modules/route-planning';
import { TripsModule } from './modules/trips';
import { VehiclesModule } from './modules/vehicles';

/**
 * Composition root: the only file that knows every module exists.
 * Module-to-module dependencies are declared in each module's own `*.module.ts`.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env', '../../.env.development', '../../.env'],
    }),
    IdentityModule,
    VehiclesModule,
    FastagModule,
    RoutePlanningModule,
    TripsModule,
  ],
})
export class AppModule {}
