import { z } from 'zod';

export const latLngSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const waypointSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  address: z.string().optional(),
  location: latLngSchema,
});

export const routePlanRequestSchema = z.object({
  origin: waypointSchema,
  destination: waypointSchema,
  waypoints: z.array(waypointSchema).optional(),
  vehicleId: z.string().uuid().optional(),
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
