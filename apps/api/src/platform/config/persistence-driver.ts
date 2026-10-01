import { ConfigService } from '@nestjs/config';

export type PersistenceDriver = 'memory' | 'prisma';

export const PERSISTENCE_DRIVER_KEY = 'PERSISTENCE_DRIVER';

export function getPersistenceDriver(config: ConfigService): PersistenceDriver {
  const driver = config.get<string>(PERSISTENCE_DRIVER_KEY, 'prisma');
  if (driver !== 'memory' && driver !== 'prisma') {
    throw new Error(`Unsupported ${PERSISTENCE_DRIVER_KEY}="${driver}". Supported values: memory, prisma`);
  }
  return driver;
}
