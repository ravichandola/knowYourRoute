import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  otp: z.string().length(6, 'OTP must be 6 digits').optional(),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^[0-9+ -]{10,14}$/, 'Invalid phone number').optional(),
});

export const tripPreferenceSchema = z.object({
  preferredStopsIntervalKm: z.number().positive().max(500).optional(),
  avoidTolls: z.boolean().optional(),
  avoidHighways: z.boolean().optional(),
  maxDrivingHoursPerDay: z.number().min(1).max(24).optional(),
  drivingStyle: z.enum(['ECONOMICAL', 'BALANCED', 'SPIRITED']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type TripPreferenceInput = z.infer<typeof tripPreferenceSchema>;
