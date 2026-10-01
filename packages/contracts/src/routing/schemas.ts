import { z } from 'zod';
import { waypointSchema } from '../shared';

export const routePlanRequestSchema = z.object({
  origin: waypointSchema,
  destination: waypointSchema,
  waypoints: z.array(waypointSchema).optional(),
  vehicleId: z.string().min(1).optional(),
  departureTime: z.string().datetime().optional(),
  preferences: z
    .object({
      avoidTolls: z.boolean().optional(),
      avoidHighways: z.boolean().optional(),
      preferScenic: z.boolean().optional(),
      prioritizeSafety: z.boolean().optional(),
    })
    .optional(),
});

export type RoutePlanRequestInput = z.infer<typeof routePlanRequestSchema>;
