import { z } from 'zod';
import { tripPreferenceSchema } from '../identity/schemas';
import { waypointSchema } from '../shared';

export const createTripSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  origin: waypointSchema,
  destination: waypointSchema,
  selectedRouteId: z.string().min(1, 'Route ID is required'),
  preferences: tripPreferenceSchema.optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
