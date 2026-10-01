import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MAPS_PROVIDER } from './maps/maps.interface';
import { MockMapsAdapter } from './maps/mock-maps.adapter';
import { WEATHER_PROVIDER } from './weather/weather.interface';
import { MockWeatherAdapter } from './weather/mock-weather.adapter';
import { TOLL_PROVIDER } from './toll/toll.interface';
import { MockTollAdapter } from './toll/mock-toll.adapter';
import { PLACES_PROVIDER } from './places/places.interface';
import { MockPlacesAdapter } from './places/mock-places.adapter';
import { FASTAG_PROVIDER } from './fastag/fastag.interface';
import { MockFastagAdapter } from './fastag/mock-fastag.adapter';
import { VEHICLE_PROVIDER } from './vehicle/vehicle.interface';
import { MockVehicleAdapter } from './vehicle/mock-vehicle.adapter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    MockMapsAdapter,
    MockWeatherAdapter,
    MockTollAdapter,
    MockPlacesAdapter,
    MockFastagAdapter,
    MockVehicleAdapter,
    {
      provide: MAPS_PROVIDER,
      useFactory: (config: ConfigService, mock: MockMapsAdapter) => {
        const mode = config.get<string>('MAP_PROVIDER', 'mock');
        // When real maps provider is configured, return RealMapsAdapter here
        return mock;
      },
      inject: [ConfigService, MockMapsAdapter],
    },
    {
      provide: WEATHER_PROVIDER,
      useFactory: (config: ConfigService, mock: MockWeatherAdapter) => {
        return mock;
      },
      inject: [ConfigService, MockWeatherAdapter],
    },
    {
      provide: TOLL_PROVIDER,
      useFactory: (config: ConfigService, mock: MockTollAdapter) => {
        return mock;
      },
      inject: [ConfigService, MockTollAdapter],
    },
    {
      provide: PLACES_PROVIDER,
      useFactory: (config: ConfigService, mock: MockPlacesAdapter) => {
        return mock;
      },
      inject: [ConfigService, MockPlacesAdapter],
    },
    {
      provide: FASTAG_PROVIDER,
      useFactory: (config: ConfigService, mock: MockFastagAdapter) => {
        return mock;
      },
      inject: [ConfigService, MockFastagAdapter],
    },
    {
      provide: VEHICLE_PROVIDER,
      useFactory: (config: ConfigService, mock: MockVehicleAdapter) => {
        return mock;
      },
      inject: [ConfigService, MockVehicleAdapter],
    },
  ],
  exports: [
    MAPS_PROVIDER,
    WEATHER_PROVIDER,
    TOLL_PROVIDER,
    PLACES_PROVIDER,
    FASTAG_PROVIDER,
    VEHICLE_PROVIDER,
  ],
})
export class ProvidersModule {}
