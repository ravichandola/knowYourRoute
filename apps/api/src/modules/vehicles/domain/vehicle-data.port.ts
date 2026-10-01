import type { VehicleProfile, VehicleSnapshot } from '@know-your-route/contracts';

export const VEHICLE_DATA_PROVIDER = 'VEHICLE_DATA_PROVIDER';

/** Port: external OEM telemetry and dashboard-photo (OCR) services. */
export interface VehicleDataProvider {
  fetchConnectedVehicleTelemetry(vinOrId: string): Promise<Partial<VehicleProfile>>;
  processDashboardImage(imageBuffer: Uint8Array | ArrayBuffer): Promise<Partial<VehicleSnapshot>>;
}
