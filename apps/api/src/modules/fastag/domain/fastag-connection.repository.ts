import type { FastagConnection } from '@know-your-route/contracts';

export const FASTAG_CONNECTION_REPOSITORY = 'FASTAG_CONNECTION_REPOSITORY';

/** Port: FASTag accounts linked to users/vehicles. */
export interface FastagConnectionRepository {
  listByUser(userId: string): Promise<FastagConnection[]>;
  findForUser(userId: string, vehicleId?: string): Promise<FastagConnection | null>;
}
