import { z } from 'zod';

export const vehicleProfileSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  variant: z.string().optional(),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  registrationNumber: z.string().min(4, 'Registration number is required').toUpperCase(),
  fuelType: z.enum(['PETROL', 'DIESEL', 'CNG', 'EV']),
  tankCapacity: z.number().positive().optional(),
  currentState: z
    .object({
      odometer: z.number().nonnegative().optional(),
      fuelLevel: z.number().min(0).max(100).optional(),
      batteryLevel: z.number().min(0).max(100).optional(),
      rangeKm: z.number().nonnegative().optional(),
    })
    .optional(),
  dataSource: z.enum(['OEM', 'PHOTO', 'USER_CONFIRMED']).default('USER_CONFIRMED'),
});

export const vehicleSnapshotSchema = z.object({
  photoBase64: z.string().min(1, 'Snapshot image required'),
  detectedOdometer: z.number().nonnegative().optional(),
  detectedFuelLevel: z.number().min(0).max(100).optional(),
  detectedBatteryLevel: z.number().min(0).max(100).optional(),
});

export type VehicleProfileInput = z.infer<typeof vehicleProfileSchema>;
export type VehicleSnapshotInput = z.infer<typeof vehicleSnapshotSchema>;
