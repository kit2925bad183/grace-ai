import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be at most 120 characters')
    .trim(),
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  phone: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(20, 'Phone must be at most 20 characters')
    .trim()
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
