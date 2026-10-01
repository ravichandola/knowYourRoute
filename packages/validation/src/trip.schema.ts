import { z } from 'zod';
import { waypointSchema } from './route.schema';

export const tripPreferenceSchema = z.object({
  preferredStopsIntervalKm: z.number().positive().max(500).optional(),
  avoidTolls: z.boolean().optional(),
  avoidHighways: z.boolean().optional(),
  maxDrivingHoursPerDay: z.number().min(1).max(24).optional(),
  drivingStyle: z.enum(['ECONOMICAL', 'BALANCED', 'SPIRITED']).optional(),
});

export const createTripSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  origin: waypointSchema,
  destination: waypointSchema,
  selectedRouteId: z.string().min(1, 'Route ID is required'),
  preferences: tripPreferenceSchema.optional(),
});

export type TripPreferenceInput = z.infer<typeof tripPreferenceSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
