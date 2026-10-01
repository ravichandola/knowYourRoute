import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../platform/database/database.module';
import { selectByConfig } from '../../platform/config/select-by-config';
import { repositoryProviders } from '../../platform/persistence/repository-provider';
import { FastagFacade } from './application/fastag.facade';
import { FastagService } from './application/fastag.service';
import {
  FASTAG_CONNECTION_REPOSITORY,
  FastagConnectionRepository,
} from './domain/fastag-connection.repository';
import { FASTAG_PROVIDER } from './domain/fastag-provider.port';
import { FastagController } from './http/fastag.controller';
import { InMemoryFastagConnectionRepository } from './infrastructure/in-memory-fastag-connection.repository';
import { MockFastagAdapter } from './infrastructure/mock-fastag.adapter';
import { PrismaFastagConnectionRepository } from './infrastructure/prisma-fastag-connection.repository';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [FastagController],
  providers: [
    FastagService,
    FastagFacade,
    ...repositoryProviders<FastagConnectionRepository>(FASTAG_CONNECTION_REPOSITORY, {
      memory: InMemoryFastagConnectionRepository,
      prisma: PrismaFastagConnectionRepository,
    }),
    MockFastagAdapter,
    {
      provide: FASTAG_PROVIDER,
      useFactory: (config: ConfigService, mock: MockFastagAdapter) =>
        selectByConfig(config, 'FASTAG_PROVIDER', { mock }, 'mock'),
      inject: [ConfigService, MockFastagAdapter],
    },
  ],
  exports: [FastagFacade],
})
export class FastagModule {}
