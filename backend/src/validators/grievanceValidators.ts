import { z } from 'zod';
import { Priority } from '../models/enums';

export const createGrievanceSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(3000, 'Description must be at most 3000 characters')
    .trim(),
  categoryId: z.string().min(1, 'Category is required'),
  wardId: z.string().min(1, 'Ward is required'),
  location: z
    .string()
    .min(3, 'Location is required')
    .max(300, 'Location must be at most 300 characters')
    .trim(),
  priority: z.nativeEnum(Priority, { errorMap: () => ({ message: 'Invalid priority' }) }),
});

export const analyzeGrievanceSchema = createGrievanceSchema;

export type CreateGrievanceBody = z.infer<typeof createGrievanceSchema>;
