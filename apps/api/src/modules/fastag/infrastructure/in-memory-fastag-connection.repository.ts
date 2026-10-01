import { Injectable } from '@nestjs/common';
import type { FastagConnection } from '@know-your-route/contracts';
import {
  DEMO_FASTAG_TAG_NUMBER,
  DEMO_USER_ID,
  DEMO_VEHICLE_ID,
} from '../../../platform/demo/demo-data';
import type { FastagConnectionRepository } from '../domain/fastag-connection.repository';

@Injectable()
export class InMemoryFastagConnectionRepository implements FastagConnectionRepository {
  private readonly connections: FastagConnection[] = [
    {
      id: 'fst_demo_1',
      userId: DEMO_USER_ID,
      vehicleId: DEMO_VEHICLE_ID,
      tagNumber: DEMO_FASTAG_TAG_NUMBER,
      bankName: 'ICICI Bank NETC FASTag',
      balance: 750,
      status: 'ACTIVE',
    },
  ];

  async listByUser(userId: string): Promise<FastagConnection[]> {
    return this.connections.filter((connection) => connection.userId === userId);
  }

  async findForUser(userId: string, vehicleId?: string): Promise<FastagConnection | null> {
    return (
      this.connections.find(
        (connection) => connection.userId === userId && (!vehicleId || connection.vehicleId === vehicleId)
      ) ?? null
    );
  }
}
