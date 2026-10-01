import { z } from 'zod';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Waypoint {
  name: string;
  address?: string;
  location: LatLng;
}

export const latLngSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const waypointSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  address: z.string().optional(),
  location: latLngSchema,
});
