import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(20).regex(/^[A-Za-z0-9_-]+$/, 'Code must be alphanumeric'),
  description: z.string().max(500).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(20).optional(),
  officeAddress: z.string().max(300).optional(),
  active: z.boolean().optional().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createPrivilegedUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  employeeCode: z.string().max(40).optional(),
  designation: z.string().max(120).optional(),
  password: z.string().min(8).max(128),
  departmentId: z.string().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING']).optional(),
});

export const createHeadSchema = createPrivilegedUserSchema.omit({ departmentId: true });

export const createDepartmentUserSchema = createPrivilegedUserSchema.extend({
  departmentId: z.string().min(1, 'Department is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().max(20).optional(),
  employeeCode: z.string().max(40).optional(),
  designation: z.string().max(120).optional(),
  departmentId: z.string().optional(),
});

export const changeRoleSchema = z.object({
  role: z.enum(['CITIZEN', 'DEPARTMENT', 'HEAD_OF_DEPARTMENTS', 'ADMIN']),
  departmentId: z.string().optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING']),
});

export const reauthenticateSchema = z.object({
  password: z.string().min(1),
});

export const createAdminSchema = createHeadSchema.extend({
  adminPassword: z.string().min(1, 'Admin password confirmation required'),
});

export const softDeleteUserSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const permanentDeleteUserSchema = z.object({
  adminPassword: z.string().min(1),
  confirmation: z.literal('DELETE USER'),
});

export const resetPasswordAdminSchema = z.object({
  newPassword: z.string().min(8).max(128),
});

export const updateSettingsSchema = z.object({
  platformName: z.string().min(2).max(120).optional(),
  supportEmail: z.string().email().optional(),
  registrationEnabled: z.boolean().optional(),
  googleLoginEnabled: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().max(500).optional(),
  aiAnalysisEnabled: z.boolean().optional(),
  duplicateDetectionEnabled: z.boolean().optional(),
  forecastingEnabled: z.boolean().optional(),
  complaintSubmissionEnabled: z.boolean().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type CreateHeadInput = z.infer<typeof createHeadSchema>;
export type CreateDepartmentUserInput = z.infer<typeof createDepartmentUserSchema>;
