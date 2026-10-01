import { z } from 'zod';

export const fastagVerifyQuerySchema = z.object({
  tollCost: z.coerce.number().nonnegative().default(0),
  vehicleId: z.string().min(1).optional(),
});

export const fastagStatusQuerySchema = z.object({
  vehicleId: z.string().min(1).optional(),
});

export type FastagVerifyQuery = z.infer<typeof fastagVerifyQuerySchema>;
export type FastagStatusQuery = z.infer<typeof fastagStatusQuerySchema>;
