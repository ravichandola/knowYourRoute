import { Provider, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PERSISTENCE_DRIVER_KEY } from '../config/persistence-driver';
import { selectByConfig } from '../config/select-by-config';

/**
 * Binds a repository port token to either its in-memory or Prisma implementation.
 * The choice is made once at boot from `PERSISTENCE_DRIVER`, never per call.
 */
export function repositoryProviders<T>(
  token: string | symbol,
  implementations: { memory: Type<T>; prisma: Type<T> }
): Provider[] {
  return [
    implementations.memory,
    implementations.prisma,
    {
      provide: token,
      useFactory: (config: ConfigService, memory: T, prisma: T) =>
        selectByConfig(config, PERSISTENCE_DRIVER_KEY, { memory, prisma }, 'memory'),
      inject: [ConfigService, implementations.memory, implementations.prisma],
    },
  ];
}
