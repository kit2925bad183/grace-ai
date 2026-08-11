import { z } from 'zod';
import { GrievanceStatus } from '../models/enums';
import { AUTHORITY_ALLOWED_STATUSES } from '../services/statusService';

export const updateStatusSchema = z.object({
  status: z.enum(AUTHORITY_ALLOWED_STATUSES as [GrievanceStatus, ...GrievanceStatus[]], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
  comment: z.string().max(500).trim().optional(),
});

export const assignOfficerSchema = z.object({
  officerId: z.string().min(1, 'Officer ID is required'),
  comment: z.string().max(500).trim().optional(),
});

export const updateDuplicateSchema = z.object({
  status: z.enum(['POTENTIAL', 'CONFIRMED', 'DISMISSED', 'MERGED'], {
    errorMap: () => ({ message: 'Invalid duplicate status' }),
  }),
});
