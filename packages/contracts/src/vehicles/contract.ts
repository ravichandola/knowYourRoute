import { createEndpointFactory } from '../http';
import { vehicleProfileSchema, vehicleSnapshotSchema } from './schemas';
import type { VehicleProfile } from './types';

const VEHICLES_BASE_PATH = 'vehicles';
const e = createEndpointFactory(VEHICLES_BASE_PATH);

export const vehiclesContract = {
  basePath: VEHICLES_BASE_PATH,
  list: e.get<VehicleProfile[]>()(''),
  get: e.get<VehicleProfile>()('/:id'),
  register: e.post<VehicleProfile>()('', { body: vehicleProfileSchema }),
  uploadSnapshot: e.post<VehicleProfile>()('/:id/snapshot', { body: vehicleSnapshotSchema }),
  syncTelemetry: e.post<VehicleProfile>()('/:id/sync-telemetry'),
} as const;
